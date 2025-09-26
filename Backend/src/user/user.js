import fastify from "fastify";
import Database from 'better-sqlite3/lib/database.js';
import dotenv from 'dotenv';
import jwt from '@fastify/jwt'
import crypto from 'node:crypto';

dotenv.config();

const app = fastify({ logger: true });

await app.register(jwt, {
  secret: process.env.JWT_SECRET,
  sign: { expiresIn: '2h' }
});

const db = new Database('./data/user.sqlite');

// penser a enlever password, juste le laisser dans auth
const user = `
    CREATE TABLE IF NOT EXISTS user (
        uuid TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        email TEXT NOT NULL,
        password TEXT,
        avatar TEXT,
        is_online INTERGER
    );
`

const friends = `
    CREATE TABLE IF NOT EXISTS friendships (
        uuid TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        friend_id TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES user(uuid),
        FOREIGN KEY (friend_id) REFERENCES user(uuid),
        UNIQUE (user_id, friend_id)
    );
`

const historic = `
    CREATE TABLE IF NOT EXISTS historic (
        uuid TEXT PRIMARY KEY,
        user_uuid TEXT,
        games JSON,
        game_win INTEGER DEFAULT 0,
        game_ratio INTEGER DEFAULT 0,
        tournament JSON,
        tournament_win INTEGER DEFAULT 0,
        tournament_ratio INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_uuid) REFERENCES user(uuid),
        UNIQUE (user_uuid, games)
    );
`
/*a mettre peut etre dans la db historic
,*/

db.exec(user);
db.exec(friends);
db.exec(historic);

app.addHook('onClose', async (instance) => {
  db.close();
});

app.post('/insert', async(request, reply) => {
    const key = request.headers['x-internal-key'];
    if (key !== process.env.JWT_SECRET) {
        return reply.code(403).send({ error: 'Forbidden' })
    }

    const { uuid, username, email, hash, avatar } = request.body;

    try{
        db.prepare('INSERT INTO user (uuid, username, email, password, avatar, is_online) VALUES (?, ?, ?, ?, ?, ?)').run(uuid, username, email, hash, avatar || null, 1);
        const historic_uuid = crypto.randomUUID();
        db.prepare('INSERT INTO historic (uuid, user_uuid, games, tournament, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)').run(historic_uuid, uuid, null, null, Date.now(), Date.now());
        reply.code(201).send({ succes: true})
    } catch (err) {
        console.error(err);
        reply.code(500).send({ error: 'Internal Server Error' });
    }
})

app.patch('/online', async(request, reply) => {
    const key = request.headers['x-internal-key'];
    if (key !== process.env.JWT_SECRET) {
        return reply.code(403).send({ error: 'Forbidden' })
    }

    const { uuid, online } = request.body;
    console.log(online);
    db.prepare('UPDATE user set is_online = ? WHERE uuid = ?').run(online, uuid);
})

app.patch('/update-info', async(request, reply) => {
    const { email, username, avatar } = request.body;
    let uuid
    try{
        uuid = await checkToken(request);
    } catch (err) {
        reply.code(401).send({ error: 'Unauthorized' });
    }
    if (!email && !username && !avatar){
        return reply.code(300).send('There are nothing change');
    }

    // Fetch current user for comparisons
    const current = db.prepare('SELECT email FROM user WHERE uuid = ?').get(uuid);

    if (email){
        const validationEmail = (email) => {
            return /^[^@]+@[^@]+\.[^@]+$/i.test(email);
        };
        if (!validationEmail(email)) {
            return reply.code(400).send({
                error: 'Invalid email'
            });
        }
        // If email unchanged, skip update
        if (!current || email !== current.email) {
            const existing = db.prepare('SELECT uuid FROM user WHERE email = ?').get(email);
            if (existing && existing.uuid !== uuid) {
                return reply.code(400).send({
                    error: 'Email already in use'
                });
            }
            db.prepare('UPDATE user set email = ? WHERE uuid = ?').run(email, uuid);
        }
    }
    if (username){
        db.prepare('UPDATE user set username = ? WHERE uuid = ?').run(username, uuid);
    }

    if (avatar)
        db.prepare('UPDATE user set avatar = ? WHERE uuid = ?').run(avatar, uuid);

    reply.send('Profile update')
});

app.get('/friendship', async(request, reply) => {
    let uuid;
    try {
        uuid = await checkToken(request);
    } catch (err) {
        reply.code(401).send({ error: 'Unauthorized'});
    }

    try {
        const accept = db.prepare(`SELECT * FROM friendships WHERE (user_id = ? OR friend_id = ?) AND status = 'accepted'`).all(uuid, uuid);
        const sentRequest = db.prepare(`SELECT * FROM friendships WHERE user_id = ? AND status = 'pending'`).all(uuid);
        const receivedRequest = db.prepare(`SELECT * FROM friendships WHERE friend_id = ? AND status = 'pending'`).all(uuid);
        const notFriend = db.prepare(`
            SELECT uuid, username, avatar, is_online 
            FROM user 
            WHERE uuid != ? 
            AND uuid NOT IN (
            SELECT friend_id FROM friendships WHERE user_id = ? 
            UNION 
            SELECT user_id FROM friendships WHERE friend_id = ?
            )`
        ).all(uuid, uuid, uuid);
    reply.send({
        friendship: accept,
        sentRequest: sentRequest,
        receivedRequest: receivedRequest,
        notFriend: notFriend
    })
    } catch(err) {
        console.error( 'GET /friendship', err );
        reply.code(500).send({ error: 'Internal Server Error' })
    }
});

app.post('/friendship/:uuid', async(request, reply) => {
    let user_id;
    try {
        user_id = await checkToken(request);
    } catch (err) {
        reply.code(401).send({ error: 'Unauthorized'});
    }
    const friend_id  = request.params.uuid;
    
    if (user_id === friend_id)
        // regarder pour le code erreur
        return reply.code(401).send({ error: 'You can\'t send invite himself'})

    const uuid = crypto.randomUUID();
    try{
        const friend = db.prepare('SELECT * FROM friendships WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)').get(user_id, friend_id, friend_id, user_id);
        if (friend)
            return reply.code(409).send({ error: 'this invite exists'});

        db.prepare('INSERT INTO friendships (uuid, user_id, friend_id, status) VALUES (?, ?, ?, ?)').run(uuid, user_id, friend_id, 'pending');

        reply.send({ message: 'Friendship request sent' })
    } catch (err) {
        console.error(err);
        reply.code(500).send({ error: user_id, friend_id });
    }
});

app.patch('/friendship/:uuid', async(request, reply) => {
    let friend_id;
    try {
        friend_id = await checkToken(request);
    } catch (err) {
        reply.code(401).send({ error: 'Unauthorized'});
    }
    const { statut } = request.body;
    const user_id = request.params.uuid;

    try {
        db.prepare('UPDATE friendships set status = ? WHERE (user_id = ? AND friend_id = ?)').run(statut, user_id, friend_id);

    } catch(err) {
        console.log(err);
        reply.code(500).send({ error: 'Internal Server Error' })
    }
});

app.delete('/friendship/:uuid', async(request, reply) => {
    let user_id;
    try {
        user_id = await checkToken(request);
    } catch (err) {
        reply.code(401).send({ error: 'Unauthorized'});
    }

    const friend_id = request.params.uuid;

    try {
        db.prepare('DELETE FROM friendships WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)').run(user_id, friend_id, friend_id, user_id);
    
    } catch(err) {
        console.log('DELETE /friendship/:uuid');
        reply.code(500).send({ error: 'Internal Server Error' });
    }
})

app.patch('/historic', async (request, reply) => {
    const key = request.headers['x-internal-key'];
    if (key !== process.env.JWT_SECRET) {
        return reply.code(403).send({ error: 'Forbidden' })
    }

    const {tournament, game} = request.body;
    console.log({tournament, game});
    if (game){
        const player1 = db.prepare('SELECT games FROM historic where user_uuid = ?').get(game.player1_uuid)
        const player2 = db.prepare('SELECT games FROM historic where user_uuid = ?').get(game.player2_uuid)
        
        let player1games = player1.games ? JSON.parse(player1.games) : [];
        let player2games = player2.games ? JSON.parse(player2.games) : [];

        player2games.push(game);
        player1games.push(game);
        
        const game1JSON = JSON.stringify(player1games);
        const game2JSON = JSON.stringify(player2games);

        const game_win1 = player1games.filter(g => g.winner === game.player1_uuid).length;
        const game_ratio1 = (game_win1 * 100 / player1games.length).toFixed(2);
        const game_win2 = player2games.filter(g => g.winner === game.player2_uuid).length;
        const game_ratio2 = (game_win2 * 100 / player2games.length).toFixed(2);

        try {
            // Mettre à jour la base de données avec les nouveaux tableaux de jeux
            db.prepare('UPDATE historic SET games = ?, game_win = ?, game_ratio = ?, updated_at = CURRENT_TIMESTAMP WHERE user_uuid = ?').run(game1JSON, Number(game_win1), Number(game_ratio1), game.player1_uuid);
            db.prepare('UPDATE historic SET games = ?, game_win = ?, game_ratio = ?, updated_at = CURRENT_TIMESTAMP WHERE user_uuid = ?').run(game2JSON, Number(game_win2), Number(game_ratio2), game.player2_uuid);
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la base de données:', error);
            reply.status(500).send({ error: 'Internal Server Error' });
        }
    }
    if (tournament){
        try{
            const players = JSON.parse(tournament.players);

            for (let uuid of players){
                let player = db.prepare('SELECT tournament FROM historic where user_uuid = ?').get(uuid);

                let tournamentArray = player.tournament ? JSON.parse(player.tournament) : [];
                tournamentArray.push(tournament);

                const tournamentJSON = JSON.stringify(tournamentArray);
                const tournament_win = tournamentArray.filter(t => t.winner === uuid).length;
                const tournament_ratio = (tournament_win * 100 / tournamentArray.length).toFixed(2);
                db.prepare('UPDATE historic SET tournament = ?, tournament_win = ?, tournament_ratio = ?, updated_at = CURRENT_TIMESTAMP WHERE user_uuid = ?').run(tournamentJSON, Number(tournament_win), Number(tournament_ratio), uuid);
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la base de données:', error);
            reply.status(500).send({ error: 'Internal Server Error' });
        }
    }
});

app.get('/search', async(request, reply) => {
    const { search } = request.body;

    try {
        const users = db.prepare('SELECT uuid, username, avatar, is_online FROM user WHERE (username LIKE ? OR uuid LIKE ?)').all(`%${search}%`, `%${search}%`);

        if (users.length === 0) {
            return reply.send({ error: 'No users found' });
        }

        reply.send({ users });
    } catch (err) {
        console.error('GET /search', err);
        reply.code(500).send({ error: 'Internal Server Error' });
    }
});

app.get('/me', async(request, reply) => {
    let uuid;
    try {
        uuid = await checkToken(request);
    } catch (err) {
        reply.code(401).send({ error: 'Unauthorized'});
    }

    const user = db.prepare(`
        SELECT
            u.uuid,
            u.username,
            u.email,
            u.avatar,
            u.is_online,
            h.games,
            h.game_win,
            h.game_ratio,
            h.tournament,
            h.tournament_win,
            h.tournament_ratio
        FROM user u
        JOIN historic h ON u.uuid = h.user_uuid
        WHERE u.uuid = ?`).get(uuid);

    if (!user) {
        return reply.code(404).send({ error: 'User not found' });
    }

    return reply.send({ user })
})


app.get('/:uuid', async(request, reply) => {
    const uuid  = request.params.uuid;

    const user = db.prepare(`
    SELECT
        uuid,
        username,
        email,
        avatar,
        is_online
    FROM user WHERE uuid = ?`).get(uuid);

    if (!user) {
        return reply.code(404).send({ error: 'User not found' });
    }

    return reply.send({ user })
})

app.delete('/delete-user', async(request, reply) => {
    const key = request.headers['x-internal-key'];
    if (key !== process.env.JWT_SECRET) {
        return reply.code(403).send({ error: 'Forbidden' })
    }

    const uuid = request.body;

    try {
        await db.prepare('DELETE FROM friendships WHERE user_id = ? OR friend_id = ?').run(uuid, uuid);
        await db.prepare('DELETE FROM historic WHERE user_uuid = ?').run(uuid);
        await db.prepare('DELETE FROM user WHERE uuid = ?').run(uuid);
    } catch(err) {
        console.error('DELETE /delete-user', err);
        reply.code(500).send({ error: 'Internal Server Error' });
    }
})


// Middleware pour vérifier le JWT et récupérer le uuid
async function checkToken(request) {
    // const authHeader = request.headers.authorization;
    // console.log('Auth Header:', authHeader);
    // if (!authHeader || !authHeader.startsWith('Bearer ')) {
    //     return reply.code(401).send({ error: 'Unauthorized' });
    // }

    // const token = authHeader.slice(7); // slice coupe le nombre de caractere donne
    const payload = await request.jwtVerify(); // methode de fastify-jwt pour verifier le token
    return payload.userId || payload.uuid;;
}

app.listen({ port: 4000, host: '0.0.0.0' })
