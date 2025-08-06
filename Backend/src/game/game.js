import fastify from 'fastify';
import { createGame, gameResponse } from "./game.schema.js";
import Database from 'better-sqlite3/lib/database.js';

const app = fastify({ logger: true });

const db = new Database('./data/game.sqlite');

const game = `
    CREATE TABLE IF NOT EXISTS game (
        id INTEGER PRIMARY KEY,
        player1 TEXT,
        player2 TEXT,
        winner TEXT
    );
`
db.exec(game);
db.close();

app.post('/game', {
    schema: {
        body: createGame,
        response: {
            201: gameResponse
        }
    }
}, async (request, reply) => {
    const { player1Id, player2Id } = request.body;

    reply.code(201).send({
        message: 'game start',
        data: { player1Id, player2Id }
    });
});

app.get('/game', async(request, reply) => {
    return 'game';
})

app.listen({ port: 4000, host: '0.0.0.0' })

export default app;