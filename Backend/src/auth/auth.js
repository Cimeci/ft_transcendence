import fastify from 'fastify';
import { userLogin, loginResponse, userSignupSchema, userResponseSchema } from './auth.schema.js';
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
db.close();

app.post('/register', async (request, reply) => {
    const { username, email, password } = request.body;
    
    const db = new Database('./data/user.sqlite');
    
    const validationPassword = (password) => {
        return /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password);
    };
    if (!validationPassword(password)) {
        return reply.code(400).send({
            error: 'Password must be at least 8 characters, include one uppercase letter, one number, and one special character.'
        });
    }

    

    const data = db.prepare('INSERT INTO user (username, email, password) VALUES (?, ?, ?)');
    const result = data.run(username, email, password);
    const d = result.lastInsertRowid;
    const stmt = db.prepare('SELECT * FROM user WHERE id = ?').get(d);
    db.close()
        return {
            id: stmt.id,
            username: stmt.username,
            email: stmt.email,
            password: stmt.password
        };
    });

app.post('/login', {
    schema: {
        body: userLogin,
        response: {
            200: loginResponse
        }
    }
}, async (request, reply) => {
    const { email, username, password } = request.body;

    reply.code(200).send({
        token: 'token',
        user: { 
            id: 1, 
            username: username || 'bob', 
            email: email ||  'bob@gmail.com' }
    });
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

export default app;