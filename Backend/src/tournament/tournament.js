import fastify from "fastify";
import { createTournament, tournamentResponse } from "./tournament.schema.js";
import Database from 'better-sqlite3/lib/database.js';

const app = fastify({ logger : true });

const db = new Database('./data/tournament.sqlite');

const tournament = `
    CREATE TABLE IF NOT EXISTS tournament (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        size INTERGER,
        winner TEXT NOT NULL
    );
`
db.exec(tournament);
db.close();

app.post('/tournament', {
        schema: {
            body: createTournament,
            response: {
                201: tournamentResponse
            }
        }
    }, async (request, reply) => {
        const { name, member } = request.body;

        // Ici tu pourrais insérer dans la DB ou juste retourner les données reçues

        reply.code(201).send ({
            message: 'tournoi cree',
            data: { name, member}
        });
    });

app.get('/tournament', async (request, reply) => {
    return("page tournament");
})

app.listen({ port: 4000, host: '0.0.0.0' })

export default app;