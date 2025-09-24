import fastify from "fastify";
import Database from 'better-sqlite3/lib/database.js';
import dotenv from 'dotenv'

const app = fastify({ logger : true });

const db = new Database('./data/tournament.sqlite');

const tournament = `
    CREATE TABLE IF NOT EXISTS tournament (
        uuid TEXT PRIMARY KEY ,
        host TEXT NOT NULL,
        name TEXT NOT NULL,
        size INTERGER,
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
            return reply.code(404).send({ error: 'Tournament not found' });
        } 
        reply.send(tournament);
    } catch(err) {
        console.error('GET /tournament/:uuid', err);
        reply.code(500).send({ error: 'Internal Server Error' });
    }
});

app.post('/tournament', async (request, reply) => {
    const { host_uuid, name, players_uuid } = request.body;
    const uuid = crypto.randomUUID();

    if (!host_uuid || !name || !Array.isArray(players_uuid) || players_uuid.length < 2)
        // regarder pour le code erreur
        return reply.code(400).send({ error: 'Invalid input' });

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
        return { message: 'Tournament created successfully', matches };
    } catch(err){
        console.error('POST /tournament', err);
        reply.code(500).send({ error: 'Internal Server Error' });
    }
    });

app.patch('/tournament/:uuid', async (request, reply) => {
    const { uuid } = request.params;
    const { uuid_player } = request.body;

    console.log({ uuid_player: uuid_player });
    if (!uuid_player)
        return reply.code(400).send({ error: 'Invalid input' });
    
    try {
        const tournament = db.prepare('SELECT * FROM tournament WHERE uuid = ?').get(uuid);
        if (!tournament) {
            return reply.code(404).send({ error: 'Tournament not found' });
        }
        const players = JSON.parse(tournament.players);
        const player = players.find(player => player === uuid_player);
        if (!player) {
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

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        reply.send('Tournament updated');
    } catch(err) {
        console.error('PATCH /tournament/:uuid', err);
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
        throw new Error('Failed to create match');

    // deconstruction d'objet, equivalent a ca:
    // const data = await res.json();
    // const uuid = data.uuid;
    const { uuid } = await res.json();
    console.log({ gameuuid: uuid })
    return uuid;
}

app.delete('/delete-tournament', async(request, reply) => {
    const key = request.headers['x-internal-key'];
    if (key !== process.env.JWT_SECRET) {
        return reply.code(403).send({ error: 'Forbidden' })
    }

    const uuid = request.body;

    try {
        await db.prepare('DELETE FROM tournament WHERE host = ?').run(uuid);
    } catch(err) {
        console.error('DELETE /delete-tournamen', err);
        reply.code(500).send({ error: 'Internal Server Error' });
    }
})

app.get('/tournament', async (request, reply) => {
    return("page tournament");
})

app.listen({ port: 4000, host: '0.0.0.0' })

export default app;