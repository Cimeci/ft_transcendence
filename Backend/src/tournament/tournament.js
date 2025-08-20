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

app.post('/tournament', async (request, reply) => {
    const { host, name, players } = request.body;
    const uuid = crypto.randomUUID();

    if (!host || !name || !Array.isArray(players) || players.length < 2)
        return reply.code(400).send({ error: 'Invalid input' });

    try {
        const round1Game = Math.floor(players.length / 2);
        const matches = [];

        for (let i = 0; i < round1Game; i++) {
            const players1 = players[i * 2];
            const players2 = players[i * 2 + 1];

            let uuidGame = await createGame(players1, players2, name);
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

        const playerJSON = JSON.stringify(players);
        const matchJSON = JSON.stringify(matches);

        db.prepare('INSERT INTO tournament (uuid, host, name, size, players, game, winner) VALUES (?, ?, ?, ?, ?, ?, ?)').run(uuid, host, name, players.length, playerJSON, matchJSON, null);
        return { message: 'Tournament created successfully', matches };
    } catch(err){
        console.error(err);
        return reply.code(500).send({ error: 'Internal Server Error' });
    }
    });

async function createGame (player1 = null, player2 = null, tournament = null ){
    const infoplay = {
        player1,
        player2,
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
    return uuid;
}


app.get('/tournament', async (request, reply) => {
    return("page tournament");
})

app.listen({ port: 4000, host: '0.0.0.0' })

export default app;