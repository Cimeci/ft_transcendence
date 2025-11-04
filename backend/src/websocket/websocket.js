import fastify from "fastify";
import fastifyMetrics from 'fastify-metrics'; 
import websocket from "@fastify/websocket";
import jwt from "@fastify/jwt";
import dotenv from 'dotenv'

dotenv.config();

// Configuration du logger fastify
// const loggerConfig = {
// 	transport: {
// 		target: 'pino/file',
// 		options: {
// 			destination: '/var/log/app/websocket-service.log',
// 			mkdir: true
// 		}
// 	},
// 	redact: ['password', 'hash', 'JWT_SECRET', 'uuid'],
// 	base: { service: 'websocket'},
// 	formatters: { time: () => `,"timestamp":"${new Date().toISOString()}"` }
// }
// const app = fastify({ logger: loggerConfig });
const app = fastify({ logger: true });

await app.register(fastifyMetrics, { endpoint: '/metrics' });

app.register(jwt, { secret: process.env.JWT_SECRET });
app.register(websocket);

const paddleWidth = 10;
const paddleHeight = 120;
const speed = 8;

let gameuuid = null;

// let ball = { x: 1400 / 2, y: 800 / 2, radius: 20, speedX: 5, speedY: 5 };
// let leftPaddle = { x: 10, y: 800 / 2 - paddleHeight / 2 };
// let rightPaddle = { x: 1400 - 20, y: 800 / 2 - paddleHeight / 2 };
// let ballRotation = 0;

// let score = { left: 0, right: 0 };
// let isGamerunning = false;
// let launchTimeout; // <-- ajouté
const BALL_SPIN_STEP = Math.PI / 6;

// let players = {
// 	left: null,
// 	right: null,
// };

const games = {};

class Game {
    constructor(uuid) {
        this.uuid = uuid;
        this.ball = { x: 1400 / 2, y: 800 / 2, radius: 20, speedX: 0, speedY: 0 };
        this.leftPaddle = { x: 10, y: 800 / 2 - paddleHeight / 2 };
        this.rightPaddle = { x: 1400 - 20, y: 800 / 2 - paddleHeight / 2 };
        this.ballRotation = 0;
        this.score = { left: 0, right: 0 };
        this.isGamerunning = false;
        this.launchTimeout = null;
        this.players = {
            left: null,
            right: null,
        };
        this.clients = [];
        this.updateGameInterval = setInterval(this.updateGame.bind(this), 1000 / 60);
    }

    resetGame() {

        this.ball = { x: 1400 / 2, y: 800 / 2, radius: 20, speedX: 0, speedY: 0 };
        this.leftPaddle = { x: 10, y: 800 / 2 - paddleHeight / 2 };
        this.rightPaddle = { x: 1400 - 20, y: 800 / 2 - paddleHeight / 2 };
        this.score = { left: 0, right: 0 };
        this.isGamerunning = false;
        
        if (this.launchTimeout) {
            clearTimeout(this.launchTimeout);
            this.launchTimeout = null;
        }
        
        // Informer tous les clients
        const gameState = { ball: this.ball, leftPaddle: this.leftPaddle, rightPaddle: this.rightPaddle, score: this.score, event: 'reset' };
        this.clients.forEach((client) => {
            if (client.readyState === 1) {
                client.send(JSON.stringify(gameState));
            }
        });
    }

    sendPaddleState() {
        const paddleState = { ball: this.ball, leftPaddle: this.leftPaddle, rightPaddle: this.rightPaddle, score: this.score };
        this.clients.forEach((client) => {
            if (client.readyState === 1) {
                client.send(JSON.stringify(paddleState));
            }
        });
    }
    
    resetBall(forceDirection = null) {   
        // Position centrale
        this.ball.x = 1400 / 2;
        this.ball.y = 800 / 2;

        // Stoppe la balle pendant l’attente
        this.ball.speedX = 0;
        this.ball.speedY = 0;
        this.ballRotation = 0;
    
        // Envoyer l'état du jeu à tous les clients pour mettre la balle au centre
        const gameState = { ball: this.ball, leftPaddle: this.leftPaddle, rightPaddle: this.rightPaddle, score: this.score };
        this.clients.forEach((client) => {
            if (client.readyState === 1) {
                    client.send(JSON.stringify(gameState));
            }
        });
    
        // Annule un éventuel timer précédent
        if (this.launchTimeout !== null) {
                clearTimeout(this.launchTimeout);
        }
    
        // Vitesse initiale
        const speed = 1400 / 200;
        const maxAngle = Math.PI / 4;
    
        // Lance la balle après un délai
        /*this.launchTimeout = setTimeout(() => {*/
                let angle = 0;
                do {
                        angle = (Math.random() * 2 - 1) * maxAngle;
                } while (Math.abs(angle) < 0.1);
    
                const direction = forceDirection ?? (Math.random() < 0.5 ? -1 : 1);
                this.ball.speedX = Math.cos(angle) * speed * direction;
                this.ball.speedY = Math.sin(angle) * speed;
                this.launchTimeout = null;
                this.isGamerunning = true;
       /* }, 1000)*/; // 1 secondes d’attente
    
        // Envoi régulier de l’état des paddles pendant l’attente, tout les 10 ms
        // const paddleState = setInterval(() => this.sendPaddleState, 1000 / 60);
        //setTimeout(clearInterval(this.updateGameInterval), 1000);
    }

    endGame() {
        if (this.score.left === 5 || this.score.right === 5) {
            const finishMessage = { 
                event: 'finish', 
                winner: this.score.left === 5 ? 'left' : 'right',
                ball: this.ball, leftPaddle: this.leftPaddle, rightPaddle: this.rightPaddle, score: this.score
            };
            
            this.clients.forEach((client) => {
                if (client.readyState === 1) {
                    client.send(JSON.stringify(finishMessage));
                }
            });
            
            this.isGamerunning = false;
            
            // Réinitialiser après 3 secondes
            setTimeout(() => {
                this.resetGame();
            }, 1000);
        }
    }
    
    updateGame() {
        if (!this.isGamerunning) return;
    
        this.ball.x += this.ball.speedX;
        this.ball.y += this.ball.speedY;
        if (this.ball.y < 0 || this.ball.y > 800) this.ball.speedY *= -1;
    
        const hitLeft = this.ball.x - this.ball.radius < this.leftPaddle.x + paddleWidth && this.ball.y > this.leftPaddle.y && this.ball.y < this.leftPaddle.y + paddleHeight;
        const hitRight = this.ball.x + this.ball.radius > this.rightPaddle.x && this.ball.y > this.rightPaddle.y && this.ball.y < this.rightPaddle.y + paddleHeight;
    
        if (hitLeft || hitRight) {
            this.ball.speedX *= -1;
            this.ballRotation += BALL_SPIN_STEP;
        }
                    
        // Score (on passe la direction du prochain service)
        if (this.ball.x < 0) {
            this.score.right++;
            this.resetBall(1);   // relance vers le joueur 1 (à droite)
        }
        if (this.ball.x > 1400) {
            this.score.left++;
            this.resetBall(-1);  // relance vers le joueur 2 (à gauche)
        }
    
        // Accélération progressive uniquement si la balle est en mouvement
        if (this.ball.speedX !== 0 || this.ball.speedY !== 0) {
            this.ball.speedX *= 1.0005;
            this.ball.speedY *= 1.0005;
    
            // Envoyer l'état du jeu à tous les clients
            const gameState = { ball: this.ball, leftPaddle: this.leftPaddle, rightPaddle: this.rightPaddle, score: this.score };
            this.clients.forEach((client) => {
                if (client.readyState === 1) {
                        client.send(JSON.stringify(gameState));
                }
            });
        }
    
        this.endGame();
    }

}

app.register(async function (app) {
	app.get('/ws/:uuid', { websocket: true }, async (socket, request) => {
		request.log.info({
				event: 'websocket_attempt'
		}, 'WebSocket connection success');
        
        // Authentification du token JWT
        // try {
        //   await request.jwtVerify();
        // } catch (err) {
        //   request.log.warn({
        //         event: 'delete-friendship_attempt'
        //     }, 'Delete Friendship Unauthorized: invalid jwt token');
        //     reply.code(401).send({ error: 'Unauthorized'});
        // }

        gameuuid = request.params.uuid;
        if (!games[gameuuid])
            games[gameuuid] = new Game(gameuuid);

        const game = games[gameuuid];
        
		let playerPosition = null;
        let playerUsername = "Player";
        
        // Assigner une position au joueur
        if (!game.players.left) {
            playerPosition = 'left';
            game.players.left = socket;
            game.clients.push(socket);
        } else if (!game.players.right) {
            playerPosition = 'right';
            game.players.right = socket;    
            game.clients.push(socket);
        
            console.log("Resetting game state for all clients", game);
            // Démarrer le jeu quand les deux joueurs sont connectés
            setTimeout(() => {
                game.resetBall();
            }, 1000);
        } else {
            // Sala pleine
            socket.send(JSON.stringify({ event: 'error', message: 'Game full' }));
            socket.close();
            return;
        }

        // Envoyer la position assignée au client
        socket.send(JSON.stringify({ 
            event: 'assigned', 
            position: playerPosition 
        }));

        // Envoyer l'état actuel du jeu
        const initialGameState = { ball: game.ball, leftPaddle: game.leftPaddle, rightPaddle: game.rightPaddle, score: game.score };
        socket.send(JSON.stringify(initialGameState));

		socket.on('message', async (message) => {
        try {
            const messageData = JSON.parse(message.toString());
            console.log('Message reçu:', messageData);

            // Récupérer le username si fourni
            if (messageData.event === 'join' && messageData.username) {
                playerUsername = messageData.username;
                    
                // Informer l'autre joueur
                const otherPlayer = playerPosition === 'left' ? game.players.right : game.players.left;
                if (otherPlayer && otherPlayer.readyState === 1) {
                    otherPlayer.send(JSON.stringify({
                        event: 'opponent_joined',
                        opponentUsername: playerUsername
                    }));
                }
            }

            // Gestion des mouvements
            if (messageData.event === 'move' && messageData.paddle === playerPosition) {
                if (playerPosition === 'left') {
                    if (messageData.direction === 'up' && game.leftPaddle.y > 2) {
                        game.leftPaddle.y -= speed;
                    } else if (messageData.direction === 'down' && game.leftPaddle.y + paddleHeight < 800 - 2) {
                        game.leftPaddle.y += speed;
                    }
                } else if (playerPosition === 'right') {
                    if (messageData.direction === 'up' && game.rightPaddle.y > 2) {
                        game.rightPaddle.y -= speed;
                    } else if (messageData.direction === 'down' && game.rightPaddle.y + paddleHeight < 800 - 2) {
                        game.rightPaddle.y += speed;
                    }
                }
            }

            // Gestion des stops
            if (messageData.event === 'stop' && messageData.paddle === playerPosition) {
                // Pour l'instant, on ne fait rien de spécial pour les stops
                // La paddle s'arrête naturellement quand on ne reçoit plus de move
            }

            } catch (error) {
                console.error('Erreur parsing message:', error);
            }
        });

        socket.on('close', () => {
            console.log(`Joueur ${playerPosition} déconnecté`);
            
            // Libérer la position
            if (playerPosition === 'left') {
                game.players.left = null;
            } else if (playerPosition === 'right') {
                game.players.right = null;
            }
            
            // Réinitialiser le jeu si un joueur part
            game.resetGame();
        });

        socket.on('error', (error) => {
            console.error('Erreur WebSocket:', error);
        });
    });
});

// setInterval(updateGame, 1000 / 60);

// Gestion des erreurs de connexion WebSocket
// app.on('ws-error', (err, req) => {
//   request.log.error({
//       error: {
//           message: error.message,
//           code: error.code,
//       },
//       event: 'websocket_attempt'
//   }, 'WebSocket error occurred');  
// });

app.listen({ port: 4000, host: '0.0.0.0' }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Serveur WebSocket démarré sur ${address}`);
});
