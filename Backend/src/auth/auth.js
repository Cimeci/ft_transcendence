import fastify from 'fastify';
import { userLogin, loginResponse, userSignupSchema, userResponseSchema } from './auth.schema.js';
import Database from 'better-sqlite3/lib/database.js';

const app = fastify({ logger: true });

// Creation de la db et de la table 
const db = new Database('./data/user.sqlite');

const user = `
    CREATE TABLE IF NOT EXISTS user (
        id INTEGER PRIMARY KEY,
        username TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    );
`
db.exec(user);
db.close();

app.post('/register', {
        schema: {
            body: userSignupSchema,
            response: {
                201: userResponseSchema,
            }
        }
    }, async (request, reply) => {
        const { username, email, password } = request.body;


    // ... logique d'enregistrement en base ...
    
        return {
            id: 1,
            username,
            email,
            created_at: new Date().toISOString()
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