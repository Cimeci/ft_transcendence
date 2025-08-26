import fastify from "fastify";
import Database from 'better-sqlite3/lib/database.js';
import dotenv from 'dotenv'

const app = fastify({ logger: true });

const db = new Database('./data/user.sqlite');

const user = `
    CREATE TABLE IF NOT EXISTS user (
        uuid TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        email TEXT NOT NULL,
        password TEXT
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
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_uuid) REFERENCES user(uuid),
        UNIQUE (user_uuid, games)
    );
`
/*a mettre peut etre dans la db historic
game_win INTEGER NOT NULL,
game_ratio INTEGER NOT NULL,
tournament_id INTEGER NOT NULL,
tournament_played INTEGER NOT NULL,
tournament_win INTEGER NOT NULL,
tournament_ratio INTEGER NOT NULL,*/

db.exec(user);
db.exec(friends);
db.exec(historic);

app.addHook('onClose', async (instance) => {
  db.close();
});

app.post('/insert', async(request, reply) => {
    const { uuid, username, email, hash } = request.body;

    try{
        db.prepare('INSERT INTO user (uuid, username, email, password) VALUES (?, ?, ?, ?)').run(uuid, username, email, hash);
        const historic_uuid = crypto.randomUUID();
        db.prepare('INSERT INTO historic (uuid, user_uuid, games, created_at, updated_at) VALUES (?, ?, ?, ?, ?)').run(historic_uuid, uuid, null, Date.now(), Date.now());
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
});

app.patch('/friendship', async(request, reply) => {
    const { statut, uuid } = request.body;

    db.prepare('UPDATE friendships set status = ? WHERE uuid = ?').run(statut, uuid);
});

app.patch('/historic', async (request, reply) => {
    const game = request.body;

    const player1 = db.prepare('SELECT games FROM historic where user_uuid = ?').get(game.player1_uuid)
    const player2 = db.prepare('SELECT games FROM historic where user_uuid = ?').get(game.player2_uuid)
    
    let player1games = player1.games ? JSON.parse(player1.games) : [];
    let player2games = player2.games ? JSON.parse(player2.games) : [];

    player2games.push(game);
    player1games.push(game);
    
    const game1JSON = JSON.stringify(player1games);
    const game2JSON = JSON.stringify(player2games);

    try {
        // Mettre à jour la base de données avec les nouveaux tableaux de jeux
        db.prepare('UPDATE historic SET games = ?, updated_at = CURRENT_TIMESTAMP WHERE user_uuid = ?').run(game1JSON, game.player1_uuid);
        db.prepare('UPDATE historic SET games = ?, updated_at = CURRENT_TIMESTAMP WHERE user_uuid = ?').run(game2JSON, game.player2_uuid);
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la base de données:', error);
        return reply.status(500).send('Erreur interne du serveur');
    }
    return { player1: game1JSON, player2: game2JSON };
});

app.get('/:id' , async (request, reply) => {
    const user = db.prepare('SELECT * FROM user WHERE id = ?').get(request.params.id);
    if (!user)
        return reply.status(404).send({error: 'User not found'});
    return user;
});

app.listen({ port: 4000, host: '0.0.0.0' })
