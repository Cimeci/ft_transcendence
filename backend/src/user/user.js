import fastify from "fastify";
import fastifyMetrics from 'fastify-metrics'; 
import Database from 'better-sqlite3/lib/database.js';
import dotenv from 'dotenv';
import jwt from '@fastify/jwt'
import crypto from 'crypto';

dotenv.config();

// Configuration du logger fastify
const loggerConfig = {
    transport: {
        target: 'pino/file',
        options: {
            destination: '/var/log/app/user-service.log',
            mkdir: true
        }
    },
    redact: ['password', 'hash', 'JWT_SECRET', 'uuid'],
    base: { service: 'user'},
    formatters: { time: () => `,"timestamp":"${new Date().toISOString()}"` }
}

const app = fastify({ logger: loggerConfig });

await app.register(fastifyMetrics, { endpoint: '/metrics' });

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
        wallet INTEGER DEFAULT 10000,
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
const inventory = `
    CREATE TABLE IF NOT EXISTS items (
        uuid TEXT PRIMARY KEY,
        user_uuid TEXT,
        ball JSON,
        background JSON,
        paddle JSON,
        avatar JSON,
        ball_use JSON,
        background_use JSON,
        paddle_use JSON,
        avatar_use JSON,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_uuid) REFERENCES user(uuid)
    );
`

const notif = `
    CREATE TABLE IF NOT EXISTS notification (
        prim_uuid TEXT PRIMARY KEY,
        uuid TEXT,
        sender_uuid TEXT,
        receiver_uuid TEXT,
        player_uuid TEXT,
        response INTEGER default 0,
        mode TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`

db.exec(user);
db.exec(friends);
db.exec(historic);
db.exec(inventory);
db.exec(notif);

app.addHook('onClose', async (instance) => {
  db.close();
});

function creationInventory(user_uuid) {
    const uuid = crypto.randomUUID();
    
    const ball = JSON.stringify([
        { id: '/ball/default_ball.png', name: 'default ball', type: 'ball', price: 0, usable: true},
        { id: '/ball/tennis_ball.png', name: 'tennis ball', type: 'ball', price: 200, usable: false},
        { id: '/ball/swenn_ball.gif', name: 'swenn ball', type: 'ball', price: 500, usable: false},
        { id: '/ball/42_ball.png', name: '42 ball', type: 'ball', price: 42, usable: false},
        { id: '/ball/c_ball.png', name: 'c ball', type: 'ball', price: 150, usable: false},
        { id: '/ball/kitty_ball.png', name: 'kitty ball', type: 'ball', price: 250, usable: false},

    ]);

    const background = JSON.stringify([
        { id: '/bg/default_bg.png', name: 'default background', type: 'background', price: 250, usable: true},
        { id: '/bg/transcendence_bg.png', name: 'transcendence background', type: 'background', price: 250, usable: false},
        { id: '/bg/matrix_bg.gif', name: 'matrix background', type: 'background', price: 250, usable: false},

    ]);

    const paddle = JSON.stringify([
        { id: '/playbar/default_bar.png' , name: 'default bar', type: 'bar', price: 0, usable: true},
        { id: '/playbar/ice_bar.png', name: 'ice bar', type: 'bar', price: 100, usable: false},
        { id: '/playbar/fire_bar.png', name: 'fire bar', type: 'bar', price: 100, usable: false},
        { id: '/playbar/amethyst_bar.png', name: 'amethyst bar', type: 'bar', price: 125, usable: false},
        { id: '/playbar/matrix_bar.gif', name: 'matrix bar', type: 'bar', price: 125, usable: false},
        { id: '/playbar/42_bar.png', name: '42 bar', type: 'bar', price: 42, usable: false},
        { id: '/playbar/helloKitty_bar.png', name: 'hello kitty bar', type: 'bar', price: 300, usable: false},
        { id: '/playbar/sequenced_bar.png', name: 'sequenced bar', type: 'bar', price: 100, usable: false},
        { id: '/playbar/mega_sequenced_bar.png', name: 'mega sequenced bar', type: 'bar', price: 125, usable: false},
        { id: '/playbar/segfault_bar.png', name: 'segfault bar', type: 'bar', price: 400, usable: false},
        { id: '/playbar/hand_bar.png', name: 'hand bar', type: 'bar', price: 300, usable: false},



    ]);

    const avatar = JSON.stringify([
        { id: '/avatar/default_avatar.png', name: 'default avatar', type: 'avatar', price: 0, usable: true},
        { id: '/avatar/rgramati.jpg', name: 'rgramati avatar', type: 'avatar', price: 1, usable: false},
        { id: '/avatar/inowak--.jpg', name: 'inowak-- avatar', type: 'avatar', price: 250, usable: false},
        { id: '/avatar/mdegache.jpg', name: 'mdegache avatar', type: 'avatar', price: 250, usable: false},
        { id: '/avatar/amblanch.jpg', name: 'amblanch avatar', type: 'avatar', price: 250, usable: false},
        { id: '/avatar/alaualik.jpg', name: 'alaualik avatar', type: 'avatar', price: 250, usable: false},
        { id: '/avatar/xavierchad.gif', name: 'xavierchad avatar', type: 'avatar', price: 250, usable: false},
        { id: '/avatar/jodougla.jpg', name: 'jodougla avatar', type: 'avatar', price: 250, usable: false},
        { id: '/avatar/ael-atmi.jpg', name: 'ael-atmi avatar', type: 'avatar', price: 250, usable: false},
        { id: '/avatar/pjurdana.jpg', name: 'pjurdana avatar', type: 'avatar', price: 250, usable: false},
        { id: '/avatar/rgodet.jpg', name: 'rgodet avatar', type: 'avatar', price: 250, usable: false},

    ]);

    const ball_use = JSON.stringify([{ id: '/ball/default_ball.png', name: 'default ball'}]); 
    const background_use =  JSON.stringify([{ id: '/bg/default_bg.png', name: 'default bg'}]);
    const paddle_use = JSON.stringify([{ id: '/playbar/default_bar.png', name: 'default bar'}]);
    const avatar_use = JSON.stringify([{ id: '/avatar/default_avatar.png', name: 'default avatar'}]);

    console.log(ball);
    db.prepare('INSERT INTO items (uuid, user_uuid, ball, background, paddle, avatar, ball_use, background_use, paddle_use, avatar_use) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .run(uuid, user_uuid, ball, background, paddle, avatar, ball_use, background_use, paddle_use, avatar_use);
}

app.post('/insert', async(request, reply) => {
    const key = request.headers['x-internal-key'];
    if (key !== process.env.JWT_SECRET) {
        request.log.warn({
            event: 'insert_attempt',
        }, 'Insert user Unauthorized: invalid jwt token');
        return reply.code(403).send({ error: 'Forbidden' })
    }

    const { uuid, username, email, hash, avatar } = request.body;
    console.log(request.body);
    try{
        db.prepare('INSERT INTO user (uuid, username, email, password, avatar, is_online) VALUES (?, ?, ?, ?, ?, ?)').run(uuid, username, email, hash, avatar || null, 1);
        const historic_uuid = crypto.randomUUID();
        db.prepare('INSERT INTO historic (uuid, user_uuid, games, tournament, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)').run(historic_uuid, uuid, null, null, Date.now(), Date.now());
        creationInventory(uuid);
        request.log.info({
            event: 'insert_attempt',
            user: { username, email }
        }, 'User insert sucess');
        reply.code(201).send({ succes: true})
    } catch (err) {
        request.log.error({
            error: {
                message: err.message,
                code: err.code
            },
            user: { email, username },
            event: 'insert_attempt'
        }, 'Insert user failed with error');
        reply.code(500).send({ error: 'Internal Server Error' });
    }
})

app.patch('/online', async(request, reply) => {
    const key = request.headers['x-internal-key'];
    if (key !== process.env.JWT_SECRET) {
        request.log.warn({
            event: 'online_attempt',
        }, 'Set user online Unauthorized: invalid jwt token');
        return reply.code(403).send({ error: 'Forbidden' })
    }

    const { uuid, online } = request.body;
    request.log.info({
        event: 'online_attempt'
    }, 'User online sucess');
    db.prepare('UPDATE user set is_online = ? WHERE uuid = ?').run(online, uuid);
})

app.patch('/update-info', async(request, reply) => {
    const { email, username, avatar } = request.body;
    let uuid
    try{
        uuid = checkToken(request);
    } catch (err) {
        request.log.warn({
            event: 'update-info_attempt'
        }, 'Update user info Unauthorized: invalid jwt token');
        reply.code(401).send({ error: 'Unauthorized' });
    }
    if (!email && !username && !avatar){
        request.log.warn({
            event: 'update-info_attempt'
        }, 'Update user info Failed: nothing to change');
        return reply.code(300).send('There are nothing change');
    }

    if (email){
        const validationEmail = (email) => {
            return /^[^@]+@[^@]+\.[^@]+$/i.test(email);
        };
        if (!validationEmail(email)) {
            request.log.warn({
                event: 'update-info_attempt'
            }, 'Update user info Failed: invalid email');
            return reply.code(400).send({ error: 'Invalid email' });
        }
        const emailExist = db.prepare('SELECT email FROM user WHERE email = ?').get(email);
        if (emailExist) {
            request.log.warn({
                event: 'update-info_attempt',
                user: { uuid }
            }, 'Update user info Failed: email already in use');
            return reply.code(400).send({
                error: 'Email already in use'
            });
        }
        db.prepare('UPDATE user set email = ? WHERE uuid = ?').run(email, uuid);
    }
    if (username){
        db.prepare('UPDATE user set username = ? WHERE uuid = ?').run(username, uuid);
    }

    if (avatar)
        db.prepare('UPDATE user set avatar = ? WHERE uuid = ?').run(avatar, uuid);

    request.log.info({
        event: 'update-info_attempt',
        user: { email, username }
    }, 'Update user infos success');
    reply.send('Profile update')
});

app.get('/wallet', async(request, reply) => {
    let uuid;
    try {
        uuid = await checkToken(request);
    } catch (err) {
        request.log.warn({
            event: 'get-wallet_attempt'
        }, 'Get Wallet Unauthorized: invalid jwt token');
        reply.code(401).send({ error: 'Unauthorized'});
    }

    const wallet = db.prepare('SELECT wallet FROM user WHERE uuid = ?').get(uuid);
    
    if (!wallet) {
        request.log.warn({
            event: 'get-wallet_attempt'
        }, 'Get Wallet Failed: wallet not found');
        return reply.code(404).send({ error: 'Wallet not found' });
    }
    request.log.info({
        event: 'get-wallet_attempt'
    }, 'Get Wallet Success');
    reply.send({ wallet: wallet.wallet });
});

app.patch('/wallet', async(request, reply) => {
    const key = request.headers['x-internal-key'];
    if (key !== process.env.JWT_SECRET) {
        request.log.warn({
            event: 'update-wallet_attempt',
        }, 'Update Wallet Unauthorized: invalid jwt token');
        return reply.code(403).send({ error: 'Forbidden' })
    }

    const { uuid, amount } = request.body;
    
    try {
        db.prepare('UPDATE user set wallet = wallet + ? WHERE uuid = ?').run(amount, uuid);
        request.log.info({
            event: 'update-wallet_attempt'
        }, 'Update Wallet Success');
        reply.send('Wallet updated')
    } catch(err) {
        request.log.error({
            error: {
                message: err.message,
                code: err.code
            },
            event: 'update-wallet_attempt'
        }, 'Update Wallet Failed');
    }
});

app.get('/friendship', async(request, reply) => {
    let uuid;
    try {
        uuid = await checkToken(request);
    } catch (err) {
        request.log.warn({
            event: 'get-friendship_attempt'
        }, 'Get Friendship Unauthorized: invalid jwt token');
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

        request.log.info({
            event: 'get-friendship_attempt'
        }, 'Friendship data retrieved successfully');

        reply.send({
            friendship: accept,
            sentRequest: sentRequest,
            receivedRequest: receivedRequest,
            notFriend: notFriend
        });
    } catch(err) {
        request.log.error({
            error: {
                message: err.message,
                code: err.code
            },
            event: 'get-friendship_attempt'
        }, 'Get friendship data failed with error');
        reply.code(500).send({ error: 'Internal Server Error' })
    }
});

app.post('/friendship/:uuid', async(request, reply) => {
    let user_id;
    try {
        user_id = await checkToken(request);
    } catch (err) {
        request.log.warn({
            event: 'set-friendship_attempt'
        }, 'Set Friendship Unauthorized: invalid jwt token');
        reply.code(401).send({ error: 'Unauthorized'});
    }
    const friend_id  = request.params.uuid;
    
    if (user_id === friend_id) {
        request.log.warn({
            event: 'set-friendship_attempt'
        }, 'Set Friendship Failed: User try to add himself as friend');
        return reply.code(401).send({ error: 'You can\'t send invite to yourself'});
    }

    const uuid = crypto.randomUUID();
    try{
        const friend = db.prepare('SELECT * FROM friendships WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)').get(user_id, friend_id, friend_id, user_id);
        if (friend){
            request.log.warn({
                event: 'set-friendship_attempt'
            }, 'Set Friendship Failed: Frien as been already invited');
            return reply.code(409).send({ error: 'this invite exists'});
        }

        db.prepare('INSERT INTO friendships (uuid, user_id, friend_id, status) VALUES (?, ?, ?, ?)').run(uuid, user_id, friend_id, 'pending');

        request.log.info({
            event: 'set-friendship_attempt'
        }, 'Set Friendship Success');
        reply.send({ message: 'Friendship request sent' })
    } catch (err) {
        request.log.error({
            error: {
                message: err.message,
                code: err.code
            },
            event: 'set-friendship_attempt'
        }, 'Set friendship failed with error');
        reply.code(500).send({ error: user_id, friend_id });
    }
});

app.patch('/friendship/:uuid', async(request, reply) => {
    let friend_id;
    try {
        friend_id = await checkToken(request);
    } catch (err) {
        request.log.warn({
            event: 'update-friendship_attempt'
        }, 'Update Friendship Unauthorized: invalid jwt token');
        reply.code(401).send({ error: 'Unauthorized'});
    }
    const { statut } = request.body;
    const user_id = request.params.uuid;

    try {
        db.prepare('UPDATE friendships set status = ? WHERE (user_id = ? AND friend_id = ?)').run(statut, user_id, friend_id);
        request.log.info({
            event: 'update-friendship_attempt'
        }, 'Update Friendship Success');
        reply.send({ message: 'Friendship request sent' })
    } catch(err) {
        request.log.error({
            error: {
                message: err.message,
                code: err.code
            },
            event: 'update-friendship_attempt'
        }, 'Update friendship failed with error');
        reply.code(500).send({ error: 'Internal Server Error' })
    }
});

app.delete('/friendship/:uuid', async(request, reply) => {
    let user_id;
    try {
        user_id = await checkToken(request);
    } catch (err) {
        request.log.warn({
            event: 'delete-friendship_attempt'
        }, 'Delete Friendship Unauthorized: invalid jwt token');
        reply.code(401).send({ error: 'Unauthorized'});
    }

    const friend_id = request.params.uuid;

    try {
        db.prepare('DELETE FROM friendships WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)').run(user_id, friend_id, friend_id, user_id);
        request.log.info({
            event: 'delete-friendship_attempt'
        }, 'Delete Friendship Success');
        reply.send({ message: 'Friendship deleted' })
    } catch(err) {
        request.log.error({
            error: {
                message: err.message,
                code: err.code
            },
            event: 'delete-friendship_attempt'
        }, 'Delete friendship failed with error');
        reply.code(500).send({ error: 'Internal Server Error' });
    }
})

app.patch('/historic', async (request, reply) => {
    const key = request.headers['x-internal-key'];
    if (key !== process.env.JWT_SECRET) {
        request.log.warn({
            event: 'update-historic_attempt',
        }, 'Update Historic Unauthorized: invalid jwt token');
        return reply.code(403).send({ error: 'Forbidden' })
    }

    const {tournament, game} = request.body;
    if (game){
        const player1 = db.prepare('SELECT games FROM historic where user_uuid = ?').get(game.player1_uuid)
        let player1games = player1.games ? JSON.parse(player1.games) : [];
        player1games.push(game);
        const game1JSON = JSON.stringify(player1games);
        const game_win1 = player1games.filter(g => g.winner === game.player1_uuid).length;
        const game_ratio1 = (game_win1 * 100 / player1games.length).toFixed(2);
        let game2JSON, game_win2, game_ratio2;

        if (game.mode === "online"){
            const player2 = db.prepare('SELECT games FROM historic where user_uuid = ?').get(game.player2_uuid)
            let player2games = player2.games ? JSON.parse(player2.games) : [];
            player2games.push(game);      
            game2JSON = JSON.stringify(player2games);
            const game_win2 = player2games.filter(g => g.winner === game.player2_uuid).length;
            game_ratio2 = (game_win2 * 100 / player2games.length).toFixed(2);
        }
        
        try {
            // Mettre à jour la base de données avec les nouveaux tableaux de jeux
            db.prepare('UPDATE historic SET games = ?, game_win = ?, game_ratio = ?, updated_at = CURRENT_TIMESTAMP WHERE user_uuid = ?').run(game1JSON, Number(game_win1), Number(game_ratio1), game.player1_uuid);
            if (game.mode === "online")
                db.prepare('UPDATE historic SET games = ?, game_win = ?, game_ratio = ?, updated_at = CURRENT_TIMESTAMP WHERE user_uuid = ?').run(game2JSON, Number(game_win2), Number(game_ratio2), game.player2_uuid);
            request.log.info({
                event: 'update-historic_attempt'
            }, 'Update Historic Success');
        } catch (error) {
        request.log.error({
            error: {
                message: err.message,
                code: err.code
            },
            event: 'update-historic_attempt'
        }, 'Update historic failed with error');
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
            request.log.info({
                event: 'update-tournament-historic_attempt'
            }, 'Update Tournament Historic Success');
            
        } catch (error) {
        request.log.error({
            error: {
                message: err.message,
                code: err.code
            },
            event: 'update-tournament-historic_attempt'
        }, 'Update Tournament Historic Failed');
        reply.status(500).send({ error: 'Internal Server Error' });
        }
    }
});

app.get('/shop', async(request, reply) => {
    let uuid;
    try {
        uuid = await checkToken(request);
    } catch (err) {
        request.log.warn({
            event: 'get-inventory_attempt'
        }, 'Get Inventory Unauthorized: invalid jwt token');
        reply.code(401).send({ error: 'Unauthorized'});
    }

    const inventory = db.prepare('SELECT ball, background, paddle, avatar FROM items WHERE user_uuid = ?').get(uuid);
    if (!inventory) {
        request.log.warn({
            event: 'get-inventory_attempt'
        }, 'Get Inventory Failed: inventory not found');
        return reply.code(404).send({ error: 'Inventory not found' });
    }

    const filteredInventory = {
        ball: JSON.parse(inventory.ball).filter(item => !item.usable),
        background: JSON.parse(inventory.background).filter(item => !item.usable),
        paddle: JSON.parse(inventory.paddle).filter(item => !item.usable),
        avatar: JSON.parse(inventory.avatar).filter(item => !item.usable),
    };

    request.log.info({
        event: 'get-inventory_attempt'
    }, 'Get Inventory Success');
    reply.send({ filteredInventory });
});

app.patch('/shop', async(request, reply) => {
    let uuid;
    try {
        uuid = await checkToken(request);
    } catch (err) {
        request.log.warn({
            event: 'get-inventory_attempt'
        }, 'Get Inventory Unauthorized: invalid jwt token');
        reply.code(401).send({ error: 'Unauthorized'});
    }

    const { ball, background, paddle, avatar, amount } = request.body;
    
    console.log("AMOUNT :", amount);
    console.log("BODY :", request.body);
    const wallet = db.prepare('SELECT wallet FROM user WHERE uuid = ?').get(uuid);
    if (!wallet || wallet.wallet < amount) {
        request.log.warn({
            event: 'update-inventory_attempt'
        }, 'Update Inventory Failed: Not enough money');
        return reply.code(400).send({ error: 'Not enough money' });
    }

    if (!ball && !background && !paddle && !avatar){
        request.log.warn({
            event: 'get-inventory_attempt'
        }, 'Get Inventory Failed: nothing to change');
        return reply.code(300).send('There are nothing change');
    }

    const inventory = db.prepare('SELECT * FROM items WHERE user_uuid = ?').get(uuid);
    if (!inventory) {
        request.log.warn({
            event: 'get-inventory_attempt'
        }, 'Get Inventory Failed: inventory not found');
        return reply.code(404).send({ error: 'Inventory not found' });
    }

    // Helper to persist array back
    function saveArray(column, arr){
        db.prepare(`UPDATE items set ${column} = ? WHERE user_uuid = ?`).run(JSON.stringify(arr), uuid);
    }

    if (ball){
        const currentBall = JSON.parse(inventory.ball);
        const ballupdate = currentBall.find(item => item.name === ball);
        if (!ballupdate) {
            request.log.warn({ event: 'update-inventory_attempt' }, 'Update Inventory Failed: ball not owned');
            return reply.code(400).send({ error: 'You do not own this ball' });
        }
        if (!ballupdate.usable) ballupdate.usable = true;
        saveArray('ball', currentBall);
    }
    
    if (background){
        const currentBackground = JSON.parse(inventory.background);
        const backgroundupdate = currentBackground.find(item => item.name === background);
        if (!backgroundupdate) {
            request.log.warn({ event: 'update-inventory_attempt' }, 'Update Inventory Failed: background not owned');
            return reply.code(400).send({ error: 'You do not own this background' });
        }
        if (!backgroundupdate.usable) backgroundupdate.usable = true;
        saveArray('background', currentBackground);
    }

    if (paddle){
        const currentPaddle = JSON.parse(inventory.paddle);
        const paddleupdate = currentPaddle.find(item => item.name === paddle);
        if (!paddleupdate) {
            request.log.warn({ event: 'update-inventory_attempt' }, 'Update Inventory Failed: paddle not owned');
            return reply.code(400).send({ error: 'You do not own this paddle' });
        }
        if (!paddleupdate.usable) paddleupdate.usable = true;
        saveArray('paddle', currentPaddle);
    }

    if (avatar){
        const currentAvatar = JSON.parse(inventory.avatar);
        const avatarupdate = currentAvatar.find(item => item.name === avatar);
        if (!avatarupdate) {
            request.log.warn({ event: 'update-inventory_attempt' }, 'Update Inventory Failed: avatar not owned');
            return reply.code(400).send({ error: 'You do not own this avatar' });
        }
        if (!avatarupdate.usable) avatarupdate.usable = true;
        saveArray('avatar', currentAvatar);
    }
    
    const walletAmount = wallet.wallet - amount;
    db.prepare('UPDATE user set wallet = ? WHERE uuid = ?').run(walletAmount, uuid);
    
    request.log.info({
        event: 'update-inventory_attempt'
    }, 'Update Inventory Success');
    reply.send('Inventory update')
});

app.get('/inventory', async(request, reply) => {
    let uuid;
    try {
        uuid = await checkToken(request);
    } catch (err) {
        request.log.warn({
            event: 'get-inventory-attempt'
        }, 'Get Inventory Unauthorized: invalid jwt token');
        reply.code(401).send({ error: 'Unauthorized'});
    }

    const inventory = db.prepare('SELECT ball, background, paddle, avatar, ball_use, background_use, paddle_use, avatar_use FROM items WHERE user_uuid = ?').get(uuid);
    if (!inventory) {
        request.log.warn({
            event: 'get-inventory_attempt'
        }, 'Get Inventory Failed: inventory not found');
        return reply.code(404).send({ error: 'Inventory not found' });
    }

    const filteredInventory = {
        ball: JSON.parse(inventory.ball),
        background: JSON.parse(inventory.background),
        paddle: JSON.parse(inventory.paddle),
        avatar: JSON.parse(inventory.avatar),
        ball_use: JSON.parse(inventory.ball_use),
        background_use: JSON.parse(inventory.background_use),
        paddle_use: JSON.parse(inventory.paddle_use),
        avatar_use: JSON.parse(inventory.avatar_use),
    };

    request.log.info({
        event: 'get-inventory_attempt'
    }, 'Get Inventory Success');
    reply.send({ filteredInventory });
});

app.patch('/inventory-use', async(request, reply) => {
    let uuid;
    try {
        uuid = await checkToken(request);
    } catch (err) {
        request.log.warn({
            event: 'get-inventory_attempt'
        }, 'Get Inventory Unauthorized: invalid jwt token');
        reply.code(401).send({ error: 'Unauthorized'});
    }
 
    const { ball_use, background_use, paddle_use, avatar_use } = request.body;

    if (!ball_use && !background_use && !paddle_use && !avatar_use){
        request.log.warn({
            event: 'get-inventory_attempt'
        }, 'Get Inventory Failed: nothing to change');
        return reply.code(300).send('There are nothing change');
    }

    const inventory = db.prepare('SELECT * FROM items WHERE user_uuid = ?').get(uuid);
    if (!inventory) {
        request.log.warn({
            event: 'get-inventory_attempt'
        }, 'Get Inventory Failed: inventory not found');
        return reply.code(404).send({ error: 'Inventory not found' });
    }

    if (ball_use){
        const currentBall = JSON.parse(inventory.ball);
        const ballupdate = currentBall.find(item => item.name === ball_use && item.usable);
        if (!ballupdate) {
            request.log.warn({
                event: 'update-inventory_attempt'
            }, 'Update Inventory Failed: ball not owned or not usable');
            return reply.code(400).send({ error: 'You do not own this ball or it is not usable' });
        }
        const ballUseJSON = JSON.stringify([{id: ballupdate.id, name: ballupdate.name}]);
        db.prepare('UPDATE items set ball_use = ? WHERE user_uuid = ?').run(ballUseJSON, uuid);
    }
    
    if (background_use){
        const currentBackground = JSON.parse(inventory.background);
        const backgroundupdate = currentBackground.find(item => item.name === background_use && item.usable);
        if (!backgroundupdate) {
            request.log.warn({
                event: 'update-inventory_attempt'
            }, 'Update Inventory Failed: background not owned or not usable');
            return reply.code(400).send({ error: 'You do not own this background or it is not usable' });
        }
        const backgroundUseJSON = JSON.stringify([{ id: backgroundupdate.id, name: backgroundupdate.name }]);
        db.prepare('UPDATE items set background_use = ? WHERE user_uuid = ?').run(backgroundUseJSON, uuid);
    }

    if (paddle_use){
        const currentPaddle = JSON.parse(inventory.paddle);
        const paddleupdate = currentPaddle.find(item => item.name === paddle_use && item.usable);
        if (!paddleupdate) {
            request.log.warn({
                event: 'update-inventory_attempt'
            }, 'Update Inventory Failed: paddle not owned or not usable');
            return reply.code(400).send({ error: 'You do not own this paddle or it is not usable' });
        }
        const paddleUseJSON = JSON.stringify([{ id: paddleupdate.id, name: paddleupdate.name }]);
        db.prepare('UPDATE items set paddle_use = ? WHERE user_uuid = ?').run(paddleUseJSON, uuid);
    }

    if (avatar_use){
        const currentAvatar = JSON.parse(inventory.avatar);
        const avatarupdate = currentAvatar.find(item => item.name === avatar_use && item.usable);
        if (!avatarupdate) {
            request.log.warn({
                event: 'update-inventory_attempt'
            }, 'Update Inventory Failed: avatar not owned or not usable');
            return reply.code(400).send({ error: 'You do not own this avatar or it is not usable' });
        }
        const avatarUseJSON = JSON.stringify([{ id: avatarupdate.id, name: avatarupdate.name }]);
        db.prepare('UPDATE items set avatar_use = ? WHERE user_uuid = ?').run(avatarUseJSON, uuid);
    }
    request.log.info({
        event: 'update-inventory_attempt'
    }, 'Update Inventory Success');
    reply.send('Inventory update')
});


app.get('/search', async(request, reply) => {
    const { search } = request.body;
    try {
        const users = db.prepare('SELECT uuid, username, avatar, is_online FROM user WHERE (username LIKE ? OR uuid LIKE ?)').all(`%${search}%`, `%${search}%`);

        if (users.length === 0) {
            request.log.warn({
                event: 'search-user_attempt'
            }, 'Search User Failed: No user to specified');
            return reply.send({ error: 'No users found' });
        }
        request.log.info({
            event: 'search-user_attempt'
        }, 'Search User Success');
        reply.send({ users });
    } catch (err) {
        request.log.error({
            error: {
                message: err.message,
                code: err.code
            },
            event: 'search-user_attempt'
        }, 'Search User Failed');
        reply.code(500).send({ error: 'Internal Server Error' });
    }
});

app.get('/me', async(request, reply) => {
    let uuid;
    try {
        uuid = await checkToken(request);
    } catch (err) {
        request.log.warn({
            event: 'get-user-infos_attempt'
        }, 'Get User Infos Unauthorized: invalid jwt token');
        reply.code(401).send({ error: 'Unauthorized'});
    }

    const user = db.prepare(`
        SELECT
            u.uuid,
            u.username,
            u.email,
            u.avatar,
            u.is_online,
            u.wallet,
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
        request.log.warn({
            event: 'get-user-infos_attempt'
        }, 'Get User Infos Failed: User not found');
        return reply.code(404).send({ error: 'User not found' });
    }
    request.log.info({
        event: 'get-user-infos_attempt'
    }, 'User Found Sucess');
    return reply.send({ user })
})

app.post('/invit/:uuid', async(request, reply) => {
    let sender_uuid;
    try {
        sender_uuid = await checkToken(request);
    } catch (err) {
        request.log.warn({
            event: 'post-invit-uuid_attempt'
        }, 'Post invit uuid Unauthorized: invalid jwt token');
        reply.code(401).send({ error: 'Unauthorized'});
    }
    
    const prim_uuid = crypto.randomUUID()
    
    const receiver_uuid = request.params.uuid;
    const { uuid, mode } = request.body;

    console.log("\nLOG UUID: ", request.body, "receiver_uuid: ", receiver_uuid, "sender_uuid: ", sender_uuid, "\n\n");

    const notif_exist = db.prepare(`SELECT * FROM notification WHERE receiver_uuid = ? AND sender_uuid = ? and response = 0`).get(receiver_uuid, sender_uuid);
    if (notif_exist){
        request.log.info({
            event: 'post-invit-uuid already exist'
        }, 'Post invit uuid Failed: invit already exist');
        return;
    }

    const sender_user = db.prepare(`SELECT * FROM user WHERE uuid = ?`).get(sender_uuid);
    const receiver_user = db.prepare(`SELECT * FROM user WHERE uuid = ?`).get(receiver_uuid);

    if (!receiver_user || !sender_user) {
        request.log.warn({
            event: 'post-invit-uuid_attempt'
        }, 'Post invit uuid Failed: User not found');
        return reply.code(404).send({ error: 'User not found' });
    }

    db.prepare('INSERT INTO notification (prim_uuid, uuid, sender_uuid, receiver_uuid, mode) VALUES (?, ?, ?, ?, ?)').run(prim_uuid, uuid, sender_uuid, receiver_uuid, mode);

    request.log.info({
        event: 'get-invit-uuid-infos_attempt'
    }, 'User invit uuid Sucess');
    return reply.send({ success: true })
});

app.patch('/invit/:uuid', async(request, reply) => {
    let receiver_uuid;
    try {
        receiver_uuid = await checkToken(request);
    } catch (err) {
        request.log.warn({
            event: 'patch-invit_attempt'
        }, 'Patch invit Unauthorized: invalid jwt token');
        return reply.code(401).send({ error: 'Unauthorized'});
    }
    
    const uuid  = request.params.uuid;
    const { response } = request.body;

    console.log("📝 Données reçues - UUID:", uuid, "| Response:", response, "| Receiver UUID:", receiver_uuid);

    try {
        const existingNotification = db.prepare('SELECT * FROM notification WHERE uuid = ? AND receiver_uuid = ?').get(uuid, receiver_uuid);
        
        if (!existingNotification) {
            request.log.warn({
                event: 'patch-invit_attempt'
            }, 'Notification not found for this user');
            return reply.code(404).send({ error: 'Notification not found' });
        }

        db.prepare('UPDATE notification SET response = ? WHERE uuid = ? AND receiver_uuid = ?').run(response, uuid, receiver_uuid);

        const mode = db.prepare('SELECT mode FROM notification WHERE uuid = ?').get(uuid);
        const user = db.prepare('SELECT username FROM user WHERE uuid = ?').get(receiver_uuid);
        
        if (response === 1) {
            try {
                const gameResponse = await fetch('http://game:4000/set-up-game', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-internal-key': process.env.JWT_SECRET
                    },
                    body: JSON.stringify({ 
                        receiver_uuid: receiver_uuid, 
                        username: user.username, 
                        uuid: uuid 
                    })
                });
                if (!gameResponse.ok) {
                    console.error('Erreur service game:', gameResponse.status);
                }
            } catch (fetchError) {
                console.error('Exception service game:', fetchError);
            }
        }
        
        if (mode && mode.mode === 'tournament' && response === 1) {
            try {
                const tournamentResponse = await fetch('http://tournament:4000/join', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `${request.headers.authorization}`,
                    },
                    body: JSON.stringify({ 
                        uuid_tournament: uuid,
                    })
                });
                if (!tournamentResponse.ok) {
                    console.error('Erreur service tournament:', tournamentResponse.status);
                }
            } catch (fetchError) {
                console.error('Exception service tournament:', fetchError);
            }
        }
        
        request.log.info({
            event: 'patch-invit_attempt'
        }, 'Invitation response processed successfully');
        
        return reply.send({ 
            success: true, 
        });
        
    } catch (err) {
        console.error('Erreur dans PATCH /invit:', err);
        console.error('Stack trace:', err.stack);
        request.log.error({
            error: {
                message: err.message,
                code: err.code,
                stack: err.stack
            },
            event: 'patch-invit_attempt'
        }, 'Patch invit failed with error');
        reply.code(500).send({ error: 'Internal Server Error' });
    }
});

app.get('/notifications', async(request, reply) => {
    let player_uuid;
    try {
        player_uuid = await checkToken(request);
    } catch (err) {
        request.log.warn({
            event: 'get-notifications_attempt'
        }, 'Get Notifications Unauthorized: invalid jwt token');
        reply.code(401).send({ error: 'Unauthorized'});
    }

    try {
        const tableExists = db.prepare(`
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='notification'
        `).get();
        
        if (!tableExists) {
            console.log('Table notification does not exist');
            return reply.send({ notifications: [] });
        }

        const notifications = db.prepare(`
            SELECT
                sender_uuid,
                receiver_uuid,
                uuid, 
                response, 
                mode
            FROM notification 
            WHERE receiver_uuid = ?
        `).all(player_uuid);

        request.log.info({
            event: 'get-notifications_attempt'
        }, 'Notifications retrieved successfully');

        return reply.send({ notifications: notifications || [] });
    } catch (err) {
        request.log.error({
            error: {
                message: err.message,
                code: err.code
            },
            event: 'get-notifications_attempt'
        }, 'Get notifications failed with error');
        reply.code(500).send({ error: 'Internal Server Error' });
    }
});

//! a voir pour delete /me
app.get('/:uuid', async(request, reply) => {
    const uuid  = request.params.uuid;

    const user = db.prepare(`
    SELECT
        u.uuid,
        u.username,
        u.email,
        u.avatar,
        u.is_online,
        u.wallet,
        h.games,
        h.game_win,
        h.game_ratio,
        h.tournament,
        h.tournament_win,
        h.tournament_ratio,
        i.ball_use,
        i.background_use,
        i.paddle_use,
        i.avatar_use,
        i.ball,
        i.background,
        i.paddle,
        i.avatar
    FROM user u
    JOIN historic h ON u.uuid = h.user_uuid
    JOIN items i ON u.uuid = i.user_uuid
    WHERE u.uuid = ?`).get(uuid);

    if (!user) {
        request.log.warn({
            event: 'get-uuid_attempt'
        }, 'Get uuid Failed: User not found');
        return reply.code(404).send({ error: 'User not found' });
    }
    user.avatar_use = JSON.parse(user.avatar_use);
    user.background_use = JSON.parse(user.background_use);
    user.paddle_use = JSON.parse(user.paddle_use);
    user.ball_use = JSON.parse(user.ball_use);

    request.log.info({
        event: 'get-uuid-infos_attempt'
    }, 'User uuid Sucess');
    return reply.send({ user })
})

app.delete('/delete-user', async(request, reply) => {
    const key = request.headers['x-internal-key'];
    if (key !== process.env.JWT_SECRET) {
        request.log.warn({
            event: 'delete-user_attempt'
        }, 'Delete User Unauthorized: invalid jwt token');
        reply.code(401).send({ error: 'Unauthorized'});
    }

    const uuid = request.body;
    try {
        await db.prepare('DELETE FROM friendships WHERE user_id = ? OR friend_id = ?').run(uuid, uuid);
        await db.prepare('DELETE FROM historic WHERE user_uuid = ?').run(uuid);
        await db.prepare('DELETE FROM user WHERE uuid = ?').run(uuid);
        request.log.info({
            event: 'delete-user_attempt'
        }, 'Delete User Sucess');

    } catch(err) {
        request.log.error({
            error: {
                message: err.message,
                code: err.code
            },
            event: 'delete-user_attempt'
        }, 'Delete User Failed');
        reply.code(500).send({ error: 'Internal Server Error' });
    }
})

app.get('/env', async(request, reply) => {
    console.log('JWT_SECRET:', process.env.JWT_SECRET);
    return reply.send({ JWT_SECRET: process.env.JWT_SECRET });
});

app.post('/jwt-test', async(request, reply) => {
    try {
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return reply.status(401).send({ error: 'Missing or invalid token' });
        }
        
        const payload = await request.jwtVerify();
        const user = db.prepare('SELECT uuid, username, email FROM user WHERE uuid = ?').get(payload.uuid);
        
        if (!user) {
            request.log.warn({
                event: 'jwt-test_attempt',
                uuid: payload.uuid
            }, 'JWT Test Failed: User not found in database');
            return reply.status(404).send({ 
                error: 'User not found in database',
                uuid: payload.uuid 
            });
        }
        
        request.log.info({
            event: 'jwt-test_attempt',
            user: { uuid: user.uuid, username: user.username }
        }, 'JWT Test Success: Token is valid and user exists');
        
        return reply.send({ 
            message: 'Token is valid and user exists', 
            payload: payload,
            user: {
                uuid: user.uuid,
                username: user.username,
                email: user.email
            }
        });
        
    } catch (err) {
        console.error('JWT Verification Error:', err);
        request.log.error({
            error: {
                message: err.message,
                code: err.code
            },
            event: 'jwt-test_attempt'
        }, 'JWT Test Failed: Invalid or expired token');
        return reply.status(401).send({ error: 'Invalid or expired token' });
    }
});

// Middleware pour vérifier le JWT et récupérer le uuid
async function checkToken(request) {
    const authHeader = request.headers.authorization;
    console.log('Auth Header:', authHeader);
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.code(401).send({ error: 'Unauthorized' });
    }

    const token = authHeader.slice(7); // slice coupe le nombre de caractere donne
    const payload = await request.jwtVerify(); // methode de fastify-jwt pour verifier le token
    return payload.uuid;
}

app.listen({ port: 4000, host: '0.0.0.0' })
