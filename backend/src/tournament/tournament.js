import fastify from "fastify";
import Database from 'better-sqlite3/lib/database.js';
import dotenv from 'dotenv'
import crypto from 'crypto';



// Configuration du logger fastify
const loggerConfig = {
    transport: {
        target: 'pino/file',
        options: {
            destination: '/var/log/app/tournament-service.log',
            mkdir: true
        }
    },
    redact: ['password', 'hash', 'JWT_SECRET', 'uuid'],
    base: { service: 'tournament'},
    formatters: { time: () => `,"timestamp":"${new Date().toISOString()}"` }
}

const app = fastify({ logger: loggerConfig });

const db = new Database('./data/tournament.sqlite');

const tournament = `
    CREATE TABLE IF NOT EXISTS tournament (
        uuid TEXT PRIMARY KEY ,
        host TEXT NOT NULL,
        name TEXT NOT NULL,
        size INTEGER,
        players JSON NOT NULL,
        game JSON NOT NULL,
        winner TEXT
    );
`
db.exec(tournament);
app.addHook('onClose', async (instance) => {
  db.close();
});

app.get('/tournament/:uuid', async (request, reply) => {
    const { uuid } = request.params;

    try {
        const tournament = db.prepare('SELECT * FROM tournament WHERE uuid = ?').get(uuid);
        if (!tournament) {
            request.log.warn({
                event: 'get-tournament_attempt',
            }, 'Get Tournament Failed: Tournament not found');
            return reply.code(404).send({ error: 'Tournament not found' });
        }
        request.log.info({
            event: 'get-tournament_attempt'
        }, ' Get Tournament sucess');
        reply.send(tournament);
    } catch(err) {
        request.log.error({
            error: {
                message: err.message,
                code: err.code
            },
            event: 'get-tournament_attempt'
        }, 'Get Tournament failed: Impossible to get tournament');
        reply.code(500).send({ error: 'Internal Server Error' });
    }
});

app.post('/tournament', async (request, reply) => {
    const { host_uuid, name, players_uuid } = request.body;
    const uuid = crypto.randomUUID();

    if (!host_uuid || !name || !Array.isArray(players_uuid) || players_uuid.length < 2) {
        request.log.warn({
            event: 'new-tournament_attempt'
        }, 'New Tournament Failed: Invalid input');
        return reply.code(400).send({ error: 'Invalid input' });
    }

    try {
        const round1Game = Math.floor(players_uuid.length / 2);
        const matches = [];

        for (let i = 0; i < round1Game; i++) {
            const players1_uuid = players_uuid[i * 2];
            const players2_uuid = players_uuid[i * 2 + 1];

            let uuidGame = await createGame(players1_uuid, players2_uuid, name);
            matches.push({uuid: uuidGame, round: 1});
        }

        let nextRound = 2;
        let restGame = Math.floor(round1Game / 2);

        while (restGame > 0){
            const matchRound = restGame;
            for (let i = 0; i < matchRound; i++) {
                let uuidGame = await createGame(null, null, name);
                matches.push({uuid: uuidGame, round: nextRound});
            }
            restGame = Math.floor(matchRound / 2);
            nextRound++
        }

        const playerJSON = JSON.stringify(players_uuid);
        const matchJSON = JSON.stringify(matches);

        db.prepare('INSERT INTO tournament (uuid, host, name, size, players, game, winner) VALUES (?, ?, ?, ?, ?, ?, ?)').run(uuid, host_uuid, name, players_uuid.length, playerJSON, matchJSON, null);
        request.log.info({
            event: 'new-tournament_attempt'
        }, 'New Tournament Created Success');
        return { message: 'Tournament created successfully', matches };
    } catch(err){
        request.log.error({
            error: {
                message: err.message,
                code: err.code
            },
            event: 'new-tournament_attempt'
        }, 'New Tournament failed with error');
        reply.code(500).send({ error: 'Internal Server Error' });
    }
    });

app.patch('/tournament/:uuid', async (request, reply) => {
    const { uuid } = request.params;
    const { uuid_player } = request.body;

    if (!uuid_player){
        request.log.warn({
            event: 'tournament-winner_attempt'
        }, 'Tournament Winner Failed: Missing uuid player');
        return reply.code(400).send({ error: 'Invalid input' });
    }
    
    try {
        const tournament = db.prepare('SELECT * FROM tournament WHERE uuid = ?').get(uuid);
        if (!tournament) {
            request.log.warn({
                event: 'tournament-winner_attempt'
            }, 'Tournament Winner Failed: Tournament not found');
            return reply.code(404).send({ error: 'Tournament not found' });
        }
        const players = JSON.parse(tournament.players);
        const player = players.find(player => player === uuid_player);
        if (!player) {
            request.log.warn({
                event: 'tournament-winner_attempt'
            }, 'Tournament Winner Failed: Player not found in tournament');
            return reply.code(404).send({ error: 'Player not found in this tournament' });
        }
        
        db.prepare('UPDATE tournament SET winner = ? WHERE uuid = ?').run(uuid_player, uuid);
        const info = db.prepare('SELECT * FROM tournament WHERE uuid = ?').get(uuid);

        const response = await fetch('http://user:4000/historic', {
            method: 'PATCH',
            headers: {
                'Content-type': 'application/json',
                'x-internal-key': process.env.JWT_SECRET
            },
            body: JSON.stringify({tournament: info, game: null})
        });

        if (!response.ok)
            throw new Error(`HTTP error! status: ${response.status}`);

        request.log.info({
            event: 'tournament-winner_attempt'
        }, 'Tournament Winner Success: Winner updated');
        reply.send('Tournament updated');
    } catch(err) {
        request.log.error({
            error: {
                message: err.message,
                code: err.code
            },
            event: 'tournament-winner_attempt'
        }, 'Tournament Winner Failed');
        reply.code(500).send({ error: 'Internal Server Error' });   
    }
});

async function createGame (player1_uuid = null, player2_uuid = null, tournament = null ){
    const infoplay = {
        player1_uuid,
        player2_uuid,
        tournament
    };

    const res = await fetch('http://game:4000/game', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(infoplay)
    });

    if (!res.ok)
        throw new Error('Failed to create game');

    // deconstruction d'objet, equivalent a ca:
    // const data = await res.json();
    // const uuid = data.uuid;
    const { uuid } = await res.json();
    return uuid;
}

app.delete('/delete-tournament', async(request, reply) => {
    const key = request.headers['x-internal-key'];
    if (key !== process.env.JWT_SECRET) {
        request.log.warn({
            event: 'delete-tournament'
        }, 'Delete Tournament Unauthorized: invalid jwt token');
        return reply.code(403).send({ error: 'Forbidden' })
    }

    const uuid = request.body;

    try {
        await db.prepare('DELETE FROM tournament WHERE host = ?').run(uuid);
        request.log.info({
            event: 'delete-tournament_attempt',
            }, 'Delete Tournament Sucess: Delete for host');
        return reply.send({ success: true });
    } catch(err) {
        request.log.error({
            error: {
                message: err.message,
                code: err.code
            },
            event: 'delete-tournament'
        }, 'Delete Tournament failed with error');
        reply.code(500).send({ error: 'Internal Server Error' });
    }
})

app.get('/tournament', async (request, reply) => {
    return("page tournament");
})

app.listen({ port: 4000, host: '0.0.0.0' })

export default app;