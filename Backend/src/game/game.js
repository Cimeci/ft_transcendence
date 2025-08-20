import fastify from 'fastify';
import Database from 'better-sqlite3/lib/database.js';
import dotenv from 'dotenv'

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
        db.prepare('UPDATE game SET score1 = ?, score2 = ?, winner = ? WHERE uuid = ?').run(score1, score2, winner, gameId);

        // faire les matchs dans l'oredre avec ce code
        const tournament = db.prepare('SELECT tournament FROM game WHERE uuid = ?').get(gameId);
        if (tournament){
            const nextGame = db.prepare('SELECT * FROM game WHERE tournament = ? AND (player1 IS NULL OR player2 IS NULL) LIMIT 1').get(tournament.tournament);
            if (nextGame){
                if (nextGame.player1 === null)
                    db.prepare('UPDATE game SET player1 = ? WHERE uuid = ?').run(winner, nextGame.uuid);
                else
                    db.prepare('UPDATE game SET player2 = ? WHERE uuid = ?').run(winner, nextGame.uuid);
            }
        }

        return 'game updated';
    } catch (err) {
        console.error(err);
        return reply.code(500).send({ error: 'Internal Server Error' });
    }
});

// app.patch('')
app.get('/game', async(request, reply) => {
    return 'game';
})

app.listen({ port: 4000, host: '0.0.0.0' })