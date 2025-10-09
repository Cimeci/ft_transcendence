import fastify from "fastify";
import Database from 'better-sqlite3/lib/database.js';
import dotenv from 'dotenv';
import jwt from '@fastify/jwt'
import crypto from 'crypto';

dotenv.config();

// Configuration du logger fastify
// const loggerConfig = {
//     transport: {
//         target: 'pino/file',
//         options: {
//             destination: '/var/log/app/user-service.log',
//             mkdir: true
//         }
//     },
//     redact: ['password', 'hash', 'JWT_SECRET', 'uuid'],
//     base: { service: 'user'},
//     formatters: { time: () => `,"timestamp":"${new Date().toISOString()}"` }
// }

// const app = fastify({ logger: loggerConfig });
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
db.exec(user);
db.exec(friends);
db.exec(historic);
db.exec(inventory);

app.addHook('onClose', async (instance) => {
  db.close();
});

function creationInventory(user_uuid) {
    const uuid = crypto.randomUUID();
    
    const ball = JSON.stringify([
        { id: 'ball/default_ball.png', name: 'default ball', type: 'ball', price: 0, usable: true},
        { id: 'ball/tennis_ball.png', name: 'tennis ball', type: 'ball', price: 250, usable: false},
        { id: 'ball/swenn_ball.gif', name: 'swenn ball', type: 'ball', price: 250, usable: false},
    ]);

    const background = JSON.stringify([
        { id: 'bg/default_bg.png', name: 'default bg', type: 'background', price: 250, usable: true},
        { id: 'bg/transcendence_bg.png', name: 'transcendence bg', type: 'background', price: 250, usable: false},
        { id: 'bg/matrix_bg.gif', name: 'matrix bg', type: 'background', price: 250, usable: false},

    ]);

    const paddle = JSON.stringify([
        { src: 'playbar/default_bar.png' ,id: 'bar/default_bar.png', name: 'default bar', type: 'bar', price: 0, usable: true},
        { src: 'playbar/ice_bar.png', id: 'bar/ice_bar.png', name: 'ice bar', type: 'bar', price: 250, usable: false},
        { src: 'playbar/fire_bar.png', id: 'bar/fire_bar.png', name: 'fire bar', type: 'bar', price: 250, usable: false},
        { src: 'playbar/amethyst_bar.png', id: 'bar/amethyst_bar.png', name: 'amethyst bar', type: 'bar', price: 250, usable: false},
        { src: 'playbar/matrix_bar.png', id: 'bar/matrix_bar.png', name: 'matrix bar', type: 'bar', price: 250, usable: false},
        { src: 'playbar/matrix_bar.png', id: 'bar/matrix_bar.png', name: 'matrix bar', type: 'bar', price: 250, usable: false},
        { src: 'playbar/matrix_bar.png', id: 'bar/matrix_bar.png', name: 'matrix bar', type: 'bar', price: 250, usable: false},
        { src: 'playbar/matrix_bar.png', id: 'bar/matrix_bar.png', name: 'matrix bar', type: 'bar', price: 250, usable: false},
        { src: 'playbar/matrix_bar.png', id: 'bar/matrix_bar.png', name: 'matrix bar', type: 'bar', price: 250, usable: false},

    ]);

    const avatar = JSON.stringify([
        { id: 'avatar/default_avatar.png', name: 'default avatar', type: 'avatar', price: 0, usable: true},
        { id: 'avatar/inowak--.jpg', name: 'inowak-- avatar', type: 'avatar', price: 250, usable: false},
        { id: 'avatar/mdegache.jpg', name: 'mdegache avatar', type: 'avatar', price: 250, usable: false},
        { id: 'avatar/amblanch.jpg', name: 'amblanch avatar', type: 'avatar', price: 250, usable: false},
        { id: 'avatar/alaualik.jpg', name: 'alaualik avatar', type: 'avatar', price: 250, usable: false},
        { id: 'avatar/xavierchad.gif', name: 'xavierchad avatar', type: 'avatar', price: 250, usable: false},
        { id: 'avatar/jodougla.jpg', name: 'jodougla avatar', type: 'avatar', price: 250, usable: false},
        { id: 'avatar/ael-atmi.jpg', name: 'ael-atmi avatar', type: 'avatar', price: 250, usable: false},
        { id: 'avatar/pjurdana.jpg', name: 'pjurdana avatar', type: 'avatar', price: 250, usable: false},
        { id: 'avatar/rgodet.jpg', name: 'rgodet avatar', type: 'avatar', price: 250, usable: false},

    ]);

    const ball_use = JSON.stringify([{ id: 'ball/default_ball.png', name: 'default ball'}]); 
    const background_use =  JSON.stringify([{ id: 'bg/default_bg.png', name: 'default bg'}]);
    const paddle_use = JSON.stringify([{ id: 'bar/default_bar.png', name: 'default bar'}]);
    const avatar_use = JSON.stringify([{ id: 'avatar/default_avatar.png', name: 'default avatar'}]);

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

    console.log(inventory);
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
 
    const { ball, background, paddle, avatar } = request.body;

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

    if (ball){
        const currentBall = JSON.parse(inventory.ball);
        console.log(currentBall);
        let ballupdate = currentBall.find(item => item.name === ball);
        if (!ballupdate) {
            request.log.warn({
                event: 'update-inventory_attempt'
            }, 'Update Inventory Failed: ball not owned');
            return reply.code(400).send({ error: 'You do not own this ball' });
        }
        ballupdate.usable = true;
        currentBall.push(ballupdate);
        const ballJSON = JSON.stringify(currentBall);
        db.prepare('UPDATE items set ball = ? WHERE user_uuid = ?').run(ballJSON, uuid);
    }
    
    if (background){
        const currentBackground = JSON.parse(inventory.background);
        let backgroundupdate = currentBackground.find(item => item.name === background);
        if (!backgroundupdate) {
            request.log.warn({
                event: 'update-inventory_attempt'
            }, 'Update Inventory Failed: background not owned');
            return reply.code(400).send({ error: 'You do not own this background' });
        }
        backgroundupdate.usable = true;
        currentBackground.push(backgroundupdate);
        const backgroundJSON = JSON.stringify(currentBackground);
        db.prepare('UPDATE items set background = ? WHERE user_uuid = ?').run(backgroundJSON, uuid);
    }

    if (paddle){
        const currentPaddle = JSON.parse(inventory.paddle);
        let paddleupdate = currentPaddle.find(item => item.name === paddle);
        if (!paddleupdate) {
            request.log.warn({
                event: 'update-inventory_attempt'
            }, 'Update Inventory Failed: paddle not owned');
            return reply.code(400).send({ error: 'You do not own this paddle' });
        }
        paddleupdate.usable = true;
        currentPaddle.push(paddleupdate);
        const paddleJSON = JSON.stringify(currentPaddle);
        db.prepare('UPDATE items set paddle = ? WHERE user_uuid = ?').run(paddleJSON, uuid);
    }

    if (avatar){
        const currentAvatar = JSON.parse(inventory.avatar);
        let avatarupdate = currentAvatar.find(item => item.name === avatar);
        if (!avatarupdate) {
            request.log.warn({
                event: 'update-inventory_attempt'
            }, 'Update Inventory Failed: avatar not owned');
            return reply.code(400).send({ error: 'You do not own this avatar' });
        }
        avatarupdate.usable = true;
        currentAvatar.push(avatarupdate);
        const avatarJSON = JSON.stringify(currentAvatar);
        db.prepare('UPDATE items set avatar = ? WHERE user_uuid = ?').run(avatarJSON, uuid);
    }
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

    const inventory = db.prepare('SELECT ball_use, background_use, paddle_use, avatar_use FROM items WHERE user_uuid = ?').get(uuid);
    if (!inventory) {
        request.log.warn({
            event: 'get-inventory_attempt'
        }, 'Get Inventory Failed: inventory not found');
        return reply.code(404).send({ error: 'Inventory not found' });
    }

    const filteredInventory = {
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
            event: 'get-uuid_attempt'
        }, 'Get uuid Failed: User not found');
        return reply.code(404).send({ error: 'User not found' });
    }
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
