import fastify from "fastify";
import Database from 'better-sqlite3/lib/database.js';

const app = fastify({ logger : true });

const db = new Database('./data/tournament.sqlite');

const tournament = `
    CREATE TABLE IF NOT EXISTS tournament (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        host TEXT NOT NULL,
        name TEXT NOT NULL,
        size INTERGER,
        players JSON NOT NULL,
        game JSON NOT NULL,
        winner TEXT NOT NULL
    );
`
db.exec(tournament);
app.addHook('onClose', async (instance) => {
  db.close();
});

app.post('/tournament', async (request, reply) => {
        const { host, name, players } = request.body;

    if (!host || !name || )

    });

app.get('/tournament', async (request, reply) => {
    return("page tournament");
})

app.listen({ port: 4000, host: '0.0.0.0' })

export default app;