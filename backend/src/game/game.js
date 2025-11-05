import fastify from 'fastify';
import fastifyMetrics from 'fastify-metrics';
import Database from 'better-sqlite3/lib/database.js';
import dotenv from 'dotenv';
import jwt from '@fastify/jwt';
import crypto from 'crypto';

dotenv.config();

// Configuration du logger fastify
// const loggerConfig = {
//     transport: {
//         target: 'pino/file',
//         options: {
//             destination: '/var/log/app/game-service.log',
//             mkdir: true
//         }
//     },
//     redact: ['password', 'hash', 'JWT_SECRET', 'uuid'],
//     base: { service: 'game'},
//     formatters: { time: () => `,"timestamp":"${new Date().toISOString()}"` }
// }

// const app = fastify({ logger: loggerConfig });
const app = fastify({ logger: true });

await app.register(jwt, {
  secret: process.env.JWT_SECRET,
  sign: { expiresIn: '2h' }
});

await app.register(fastifyMetrics, { endpoint: '/metrics' });

const db = new Database('./data/game.sqlite');

const game = `
    CREATE TABLE IF NOT EXISTS game (
        uuid TEXT PRIMARY KEY,
        player1 TEXT,
        player1_uuid TEXT,
        player2 TEXT,
        player2_uuid TEXT,
        score1 INTEGER DEFAULT 0,
        score2 INTEGER DEFAULT 0,
        mode TEXT,
        tournament TEXT,
        winner TEXT
    );
`
db.exec(game);
app.addHook('onClose', async (instance) => {
  db.close();
});

app.post('/game', async (request, reply) => {
    console.log("POST Game")
    let player1_uuid;
    try {
        player1_uuid = await checkToken(request);
    } catch {
        request.log.warn({
            event: 'new-game_attempt',
        }, 'New Game Unauthorized: invalid jwt token');
        return reply.code(403).send({ error: 'Forbidden' })
    }
    const { player1, player2, player2_uuid, mode ,tournament } = request.body;
    const uuid = crypto.randomUUID();
    try {
        if (mode === "local"){
            db.prepare('INSERT INTO game (uuid, player1, player1_uuid, player2, player2_uuid, mode, tournament, winner) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(uuid, player1, player1_uuid, player2, player2_uuid, mode, null, null);
            console.log("local game created");}
        else{
            const gameExists = db.prepare('SELECT * FROM game WHERE (player1_uuid = ? AND player2_uuid = ? OR player1_uuid = ? AND player2_uuid = ?) AND winner IS NULL').get(player1_uuid, player2_uuid, player2_uuid, player1_uuid);
            if (gameExists) {
                request.log.warn({
                    event: 'game-exists'
                    }, 'Game Exists: A game between these players is already in progress');
                return reply.send({ uuid: gameExists.uuid});
            };
            //db.prepare('INSERT INTO game (uuid, player1, player1_uuid, player2, player2_uuid, mode, tournament, winner) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(uuid, player1, player1_uuid, player2, player2_uuid, mode, tournament || null, null);
            db.prepare('INSERT INTO game (uuid, player1, player1_uuid, player2, player2_uuid, mode, tournament, winner) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(uuid, player1, player1_uuid, player2, player2_uuid, mode, tournament || null, null);
        }
        request.log.info({
            event: 'new-game_attempt'
        }, 'New Game Sucess: Game created');
        reply.send({ uuid });
    } catch (err) {
        request.log.error({
            error: {
                message: err.message,
                code: err.code
            },
            event: 'new-game_attempt'
        }, 'New Game Failed: Impossible to create new one');
        reply.code(500).send({ error: 'Internal Server Error' });
    }
});

app.patch('/update-game/:gameId', async (request, reply) => {
    const { gameId } = request.params;
    const { score1, score2, winner } = request.body;

    const data = db.prepare('SELECT player1_uuid, player2_uuid FROM game WHERE uuid = ?').get(gameId);
    if (!data) {
        request.log.warn({
            event: 'update-game_attempt'
        }, 'Update Game Failed: Game not found');
        return reply.code(404).send({ error: 'Game not found' });
    }
    let winner_uuid = score1 == 5 ? data.player1_uuid : data.player2_uuid || null;
    try {
        db.prepare('UPDATE game SET score1 = ?, score2 = ?, winner = ? WHERE uuid = ?').run(score1, score2, winner_uuid, gameId);

        // faire les matchs dans l'ordre avec ce code
        const game = db.prepare('SELECT * FROM game WHERE uuid = ?').get(gameId);
        if (game.tournament){
            const nextGame = db.prepare('SELECT * FROM game WHERE tournament = ? AND (player1 IS NULL OR player2 IS NULL) LIMIT 1').get(game.tournament);
            if (nextGame){
                if (nextGame.player1 === null)
                    db.prepare('UPDATE game SET player1 = ? WHERE uuid = ?').run(winner, nextGame.uuid);
                else
                    db.prepare('UPDATE game SET player2 = ? WHERE uuid = ?').run(winner, nextGame.uuid);
            }
        }

        await fetch('http://user:4000/historic', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'x-internal-key': process.env.JWT_SECRET
            },
            body: JSON.stringify({tournament: null, game: game})
        });
        request.log.info({
            event: 'update-game_attempt'
        }, 'Update Game Sucess');
        reply.send(game);
    } catch (err) {
        request.log.error({
            error: {
                message: err.message,
                code: err.code
            },
            event: 'update-game_attempt'
        }, 'Update Game Failed');
        reply.code(500).send({ error: 'Internal Server Error' });
    }
});

app.patch('/set-up-game', async(request, reply) => {
    const key = request.headers['x-internal-key'];
    if (key !== process.env.JWT_SECRET) {
        request.log.warn({
            event: 'patch-invit_attempt',
        }, 'Patch Invit Unauthorized: invalid jwt token');
        return reply.code(403).send({ error: 'Forbidden' })
    }

    const { receiver_uuid, username, uuid } = request.body;
    try {
        db.prepare('UPDATE game SET player2 = ?, player2_uuid = ? WHERE uuid = ?').run(username, receiver_uuid, uuid);
        request.log.info({
            event: 'patch-invit_attempt'
        }, 'Patch Invit Sucess: player2 added to game');
        reply.send({ success: true });
    } catch(err) {
        request.log.error({
            error: {
                message: err.message,
                code: err.code
            },
            event: 'patch-invit_attempt'
        }, 'Patch Invit Failed');
        reply.code(500).send({ error: 'Internal Server Error' });
    }
});

app.get('/game/:uuid', async(request, reply) => {
    const { uuid } = request.params;
    
    try {
        const game = db.prepare('SELECT * FROM game WHERE uuid = ?').get(uuid);
        if (!game) {
            request.log.warn({
                event: 'get-game_attempt'
            }, 'Get Game Failed: Game not found');
            return reply.code(404).send({ error: 'Game not found' });
        }
        request.log.info({
            event: 'get-game_attempt'
        }, 'Get Game Sucess');
        reply.send(game);
    } catch(err) {
        request.log.error({
            error: {
                message: err.message,
                code: err.code
            },
            event: 'get-game_attempt'
        }, 'Get Game Failed: Failed to fetch Game');
        reply.code(500).send({ error: 'Internal Server Error' });
    }
})

app.delete('/delete-game', async(request, reply) => {
    const key = request.headers['x-internal-key'];
    if (key !== process.env.JWT_SECRET) {
        request.log.warn({
            event: 'delete-game_attempt',
        }, 'Delete Game Unauthorized: invalid jwt token');
        return reply.code(403).send({ error: 'Forbidden' })
    }

    const uuid = request.body;
    try {
        await db.prepare('DELETE FROM game WHERE player1_uuid = ? OR player2_uuid = ?').run(uuid, uuid);
        request.log.info({
            event: 'delete-game_attempt'
        }, 'Delete Game Sucess');
        reply.send({ sucess: true });
    } catch(err) {
        request.log.error({
            error: {
                message: err.message,
                code: err.code
            },
            event: 'delete-game_attempt'
        }, 'Delete Game Failed');
        reply.code(500).send({ error: 'Internal Server Error' });
    }
})

// Middleware pour vérifier le JWT et récupérer le uuid
async function checkToken(request) {
    const authHeader = request.headers.authorization;
    console.log('Auth Header:', authHeader);
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.code(401).send({ error: 'Unauthorized' });
    }

    const token = authHeader.slice(7); // slice coupe le nombre de caractere donne
    const payload = await request.jwtVerify(); // methode de fastify-jwt pour verifier le token
    console.log('Payload:', payload.uuid);
    return payload.uuid;
}

app.listen({ port: 4000, host: '0.0.0.0' })
