import fastify from 'fastify';
import Database from 'better-sqlite3/lib/database.js';

const app = fastify({ logger: true });

const db = new Database('./data/game.sqlite');

const game = `
    CREATE TABLE IF NOT EXISTS game (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    const { player1Id, player2Id, tournament } = request.body;

    try {
        db.prepare('INSERT INTO game (player1, player2, tournament, winner) VALUES (?, ?, ?, ?)').run(player1Id, player2Id, tournament || null, null);

        return 'game start'
    } catch (err) {
        console.error(err);
        return reply.code(500).send({ error: 'Internal Server Error' });
    }
});

app.patch('/update-game/:gameId', async (request, reply) => {
    const { gameId } = request.params;
    const { score1, score2, winner } = request.body;

    try {
        db.prepare('UPDATE game SET score1 = ?, score2 = ?, winner = ? where id = ?').run(score1, score2, winner, gameId);

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