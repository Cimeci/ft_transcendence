import fastify from "fastify";
import Database from 'better-sqlite3/lib/database.js';
import dotenv from 'dotenv'

const app = fastify({ logger: true });

const db = new Database('./data/user.sqlite');

const user = `
    CREATE TABLE IF NOT EXISTS user (
        uuid TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
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
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        game_id INTEGER NOT NULL,
        game_win INTEGER NOT NULL,
        game_ratio INTEGER NOT NULL,
        tournament_id INTEGER NOT NULL,
        tournament_played INTEGER NOT NULL,
        tournament_win INTEGER NOT NULL,
        tournament_ratio INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES user(id),
        UNIQUE (user_id, game_id, tournament_id)
    );
`

db.exec(user);
db.exec(friends);
db.exec(historic);

app.addHook('onClose', async (instance) => {
  db.close();
});

app.post('/insert', async(request, reply) => {
    const { uuid, username, email, hash } = request.body;

    if (!hash) {
        return reply.code(400).send({ error: 'All fields are required' });
    }

    try{
        db.prepare('INSERT INTO user (uuid, username, email, password) VALUES (?, ?, ?, ?)').run(uuid, username, email, hash);
    } catch (err) {
        console.error(err);
        return reply.code(500).send({ error: 'Internal Server Error' });
    }
})

app.post('/friendship', async(request, reply) => {
    const { user_id, friend_id } = request.body;
    const uuid = crypto.randomUUID();

    try{
        db.prepare('INSERT INTO friendships (uuid, user_id, friend_id, status) VALUES (?, ?, ?, ?)').run(uuid, user_id, friend_id, 'pending');

        return { message: 'Friendship request sent' }
    } catch (err) {
        console.error(err);
        return reply.code(500).send({ error: user_id, friend_id });
    }
})

// app.post('/historic', async (request, reply) => {
//     const { user_id, game_id, game_win, game_played, tournament_id, tournament_win, tournament_played } = request.body;

//     try {
//         const game_ratio = game_played > 0 ? game_win / game_played : 0;
//         const tournament_ratio = tournament_played > 0 ? tournament_win / tournament_played : 0;

//         const insertStmt = db.prepare(`
//             INSERT INTO historic (user_id, game_id, game_win, game_played, game_ratio, tournament_id, tournament_win, tournament_played, tournament_ratio)
//             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
//             ON CONFLICT(user_id, game_id, tournament_id) DO UPDATE 
//             SET 
//                 game_win = excluded.game_win, 
//                 game_played = excluded.game_played, 
//                 game_ratio = excluded.game_ratio, 
//                 tournament_win = excluded.tournament_win, 
//                 tournament_played = excluded.tournament_played, 
//                 tournament_ratio = excluded.tournament_ratio, 
//                 updated_at = CURRENT_TIMESTAMP
//         `);
//         insertStmt.run(user_id, game_id, game_win, game_played, game_ratio, tournament_id, tournament_win, tournament_played, tournament_ratio);
//         return { message: 'Historic data inserted or updated' };
//     } catch (err) {
//         console.error(err);
//         return reply.code(500).send({ error: 'Internal Server Error' });
//     }
// });

app.get('/:id' , async (request, reply) => {
    const user = db.prepare('SELECT * FROM user WHERE id = ?').get(request.params.id);
    if (!user)
        return reply.status(404).send({error: 'User not found'});
    return user;
});

app.listen({ port: 4000, host: '0.0.0.0' })
