import fastify from "fastify";
import Database from 'better-sqlite3/lib/database.js';

const app = fastify({ logger: true });

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

//test
app.get('/users/:id' , async (request, reply) => {
    const user = fastify.db.prepare('SELECT * FROM test WHERE id = ?').get(request.params.id);
    if (!user)
        return reply.status(404).send({error: 'User not found'});
    return user;
});

app.listen({ port: 4000, host: '0.0.0.0' })

export default app;
