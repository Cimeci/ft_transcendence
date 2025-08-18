import fastify from 'fastify';
import Database from 'better-sqlite3/lib/database.js';

const app = fastify({ logger: true });

const db = new Database('./data/game.sqlite');

const game = `
    CREATE TABLE IF NOT EXISTS game (
        uuid TEXT PRIMARY KEY,
        player1 TEXT,
        player2 TEXT,
        score1 INTEGER DEFAULT 0,
        score2 INTEGER DEFAULT 0,
        tournament TEXT,
        winner TEXT
    );
`
db.exec(game);
app.addHook('onClose', async (instance) => {
  db.close();
});

app.post('/game', async (request, reply) => {
    const { player1, player2, tournament } = request.body;
    const uuid = crypto.randomUUID();

    try {
        db.prepare('INSERT INTO game (uuid, player1, player2, tournament, winner) VALUES (?, ?, ?, ?, ?)').run(uuid, player1, player2, tournament || null, null);

        reply.send({ uuid });
    } catch (err) {
        console.error(err);
        return reply.code(500).send({ error: 'Internal Server Error' });
    }
});

app.patch('/update-game/:gameId', async (request, reply) => {
    const { gameId } = request.params;
    const { score1, score2, winner } = request.body;

    try {
        db.prepare('UPDATE game SET score1 = ?, score2 = ?, winner = ? where uuid = ?').run(score1, score2, winner, gameId);

        return 'game updated';
    } catch (err) {
        console.error(err);
        return reply.code(500).send({ error: 'Internal Server Error' });
    }
});

app.get('/game', async(request, reply) => {
    return 'game';
})

app.listen({ port: 4000, host: '0.0.0.0' })