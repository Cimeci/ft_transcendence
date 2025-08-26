import fastify from 'fastify';
import Database from 'better-sqlite3/lib/database.js';
import bcrypt from 'bcrypt';
import fastifyOauth2 from '@fastify/oauth2';
import dotenv from 'dotenv';
import jwt from '@fastify/jwt';

dotenv.config();
console.log('URL:', process.env.GLOBAL_URL);

const app = fastify({ logger: true });

await app.register(jwt, {
  secret: process.env.JWT_SECRET,
  sign: { expiresIn: '2h' }
});
// Creation de la db et de la table 
const db = new Database('./data/user.sqlite');

const user = `
    CREATE TABLE IF NOT EXISTS user (
        uuid TEXT PRIMARY KEY,
        google_id TEXT,
        username TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT
    );
`
db.exec(user);

app.addHook('onClose', async (instance) => {
  db.close();
});

app.post('/register', async (request, reply) => {
    const { username, email, password } = request.body;
    const uuid = crypto.randomUUID();
    
    try {
        const validationPassword = (password) => {
            return /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password);
        };
        if (!validationPassword(password)) {
            return reply.code(400).send({
                error: 'Password must be at least 8 characters, include one uppercase letter, one number, and one special character.'
            });
        }
        const hash = await bcrypt.hash(password, 10);

        const validationEmail = (email) => {
            return /^[^@]+@[^@]+\.[^@]+$/i.test(email);
        };
        if (!validationEmail(email)) {
            return reply.code(400).send({
                error: 'Invalid email'
            });
        }
        const emailExist = db.prepare('SELECT email FROM user WHERE email = ?').get(email);
        if (emailExist) {
            return reply.code(400).send({
                error: 'Email already in use'
            });
        }

        const usernameExist = db.prepare('SELECT username FROM user WHERE username = ?').get(username);;
        if (usernameExist) {
            return reply.code(400).send({
                error: 'Username already in use'
            });
        }

        db.prepare('INSERT INTO user (uuid, username, email, password) VALUES (?, ?, ?, ?)').run(uuid, username, email, hash);
        const info = { uuid, username, email, hash }
        const jwtToken = await app.jwt.sign({ userId: uuid });
        
        await fetch('http://user:4000/insert', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(info)
        });
        
        return {
            uuid: info.uuid,
            username: info.username,
            email: info.email,
            hash: info.hash
        };
    } catch (err) {
        console.error(err);
        return reply.code(500).send({ error: 'Internal Server Error' });
    }
});

app.post('/login', async (request, reply) => {
    const { id, password } = request.body;

    try{

        const user = db.prepare('SELECT * FROM user WHERE username = ? OR email = ?').get(id, id);
        if (!user) {
            return reply.code(401).send({ error: 'Invalid identifiers or password'});
        }

        const pass = await bcrypt.compare(password, user.password);
        if (!pass) {
            return reply.code(401).send({ error: 'Invalid identifier or password'});
        }

        const jwtToken = await app.jwt.sign({ userId: user.uuid, email: user.email  });
        reply.send({ jwtToken })
    }catch {
        console.error(err);
        return reply.code(500).send({ error: 'Internal Server Error' });

    }
});

app.register(fastifyOauth2, {
    name: 'google',
    scope: ['email', 'profile'],
    credentials: {
        client: {
            id: process.env.GOOGLE_CLIENT_ID,
            secret: process.env.GOOGLE_CLIENT_SECRET
        },
        auth : fastifyOauth2.GOOGLE_CONFIGURATION
        /*utilise la configuration predefinie pour google, ca vaut ca en general:
        tokenHost: 'https://accounts.google.com',
        authorizePath: '/o/oauth2/v2/auth',
        tokenPath: '/o/oauth2/token'*/
    },
    startRedirectPath: '/google/login',
    callbackUri: `${process.env.GLOBAL_URL}/auth/google/callback`
});

// route pour initier la redirection vers Google OAuth2
// app.get('/google/login', async (request, reply) => {
//   const url = await app.googleOAuth2.getAuthorizationUrl();
//   reply.redirect(url);
// });

app.get('/google/callback', async(request, reply) => {
    if (!app.google) {
        console.error('google is not initialized');
        return reply.code(500).send({ error: 'Internal Server Error' });
    }
    try {
        //recuperation du token d'acces et du token de rafraichisement
        const { token } = await app.google.getAccessTokenFromAuthorizationCodeFlow(request);
        
        //requete HTTP pour recuperer la data
        const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token.access_token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        //mettre en json pour ensuite mettre dans la db
        const {id: google_id, email, given_name } = await response.json();
        let jwtToken;

        const user = db.prepare('SELECT * FROM user WHERE email = ?').get(email);
        if (user) {
            jwtToken = await app.jwt.sign({ userId: user.uuid });
            reply.send({ message: 'Logged in successfully', token: jwtToken });
        } else {
            const uuid = crypto.randomUUID();
            db.prepare('INSERT INTO user (uuid, google_id, username, email, password) VALUES (?, ?, ?, ?, ?)').run(uuid, google_id, given_name, email, null);
            jwtToken = await app.jwt.sign({ userId: uuid });

            const info = { uuid: uuid, username: given_name, email: email, hash: null }
            await fetch('http://user:4000/insert', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(info)
            });
        }

        reply.send({ message: 'logged in successfully', token: jwtToken });
    } catch (err) {
        console.error(err);
        reply.code(500).send({ error: 'internal Server Error' 

        });
    }
});

app.setErrorHandler((error, request, reply) => {
    console.error('Error:', error);
    reply.status(500).send({ error: 'Internal Server Error' });
});

app.get('/', async(request, reply) => {
    return 'hello';
});

app.get('/register', async(request, reply) => {
    return 'register';
});

app.get('/login', async(request, reply) => {
    return 'login';
});

app.listen({ port: 4000, host: '0.0.0.0' })