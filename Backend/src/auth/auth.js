import fastify from 'fastify';
import Database from 'better-sqlite3/lib/database.js';
import bcrypt from 'bcrypt'

const app = fastify({ logger: true });

// Creation de la db et de la table 
const db = new Database('./data/user.sqlite');

const user = `
    CREATE TABLE IF NOT EXISTS user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    );
`
db.exec(user);

app.addHook('onClose', async (instance) => {
  db.close();
});

app.post('/register', async (request, reply) => {
    const { username, email, password } = request.body;
    
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

        const data = db.prepare('INSERT INTO user (username, email, password) VALUES (?, ?, ?)').run(username, email, hash);
        const d = data.lastInsertRowid;
        const stmt = db.prepare('SELECT * FROM user WHERE id = ?').get(d);
        
        await fetch('http://user:4000/insert', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(stmt)
        });
        
        return {
            id: stmt.id,
            username: stmt.username,
            email: stmt.email,
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

        return {
            log: 'you are log'
        }
    }catch {
        console.error(err);
        return reply.code(500).send({ error: 'Internal Server Error' });

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