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
const speed = 6;

let ball = { x: 1400 / 2, y: 800 / 2, radius: 20, speedX: 5, speedY: 5 };
let leftPaddle = { x: 10, y: 800 / 2 - paddleHeight / 2 };
let rightPaddle = { x: 1400 - 20, y: 800 / 2 - paddleHeight / 2 };
let ballRotation = 0;

let score = { left: 0, right: 0 };
let isGamerunning = false;
let launchTimeout; // <-- ajouté
const BALL_SPIN_STEP = Math.PI / 6;

let players = {
	left: null,
	right: null,
};

function resetGame() {
    ball = { x: 1400 / 2, y: 800 / 2, radius: 20, speedX: 0, speedY: 0 };
    leftPaddle = { x: 10, y: 800 / 2 - paddleHeight / 2 };
    rightPaddle = { x: 1400 - 20, y: 800 / 2 - paddleHeight / 2 };
    score = { left: 0, right: 0 };
    isGamerunning = false;
    
    if (launchTimeout) {
        clearTimeout(launchTimeout);
        launchTimeout = null;
    }
    
    // Informer tous les clients
    const gameState = { ball, leftPaddle, rightPaddle, score, event: 'reset' };
    app.websocketServer.clients.forEach((client) => {
        if (client.readyState === 1) {
            client.send(JSON.stringify(gameState));
        }
    });
}

function resetBall(forceDirection = null) {
		// Position centrale
		ball.x = 1400 / 2;
		ball.y = 800 / 2;

		// Stoppe la balle pendant l’attente
		ball.speedX = 0;
		ball.speedY = 0;
		ballRotation = 0;

		// Envoyer l'état du jeu à tous les clients pour mettre la balle au centre
		const gameState = { ball, leftPaddle, rightPaddle, score };
		app.websocketServer.clients.forEach((client) => {
			if (client.readyState === 1) {
					client.send(JSON.stringify(gameState));
			}
		});

		// Annule un éventuel timer précédent
		if (launchTimeout !== null) {
				clearTimeout(launchTimeout);
		}

		// Vitesse initiale
		const speed = 1400 / 200;
		const maxAngle = Math.PI / 4;

		// Lance la balle après un délai
		launchTimeout = setTimeout(() => {
				let angle = 0;
				do {
						angle = (Math.random() * 2 - 1) * maxAngle;
				} while (Math.abs(angle) < 0.1);

				const direction = forceDirection ?? (Math.random() < 0.5 ? -1 : 1);
				ball.speedX = Math.cos(angle) * speed * direction;
				ball.speedY = Math.sin(angle) * speed;
				launchTimeout = null;
				isGamerunning = true;
		}, 1000); // 1 secondes d’attente
}

function endGame() {
    if (score.left === 5 || score.right === 5) {
        const finishMessage = { 
            event: 'finish', 
            winner: score.left === 5 ? 'left' : 'right',
            ball, leftPaddle, rightPaddle, score 
        };
        
        app.websocketServer.clients.forEach((client) => {
            if (client.readyState === 1) {
                client.send(JSON.stringify(finishMessage));
            }
        });
        
        isGamerunning = false;
        
        // Réinitialiser après 3 secondes
        setTimeout(() => {
            resetGame();
        }, 3000);
    }
}

function updateGame() {
	if (!isGamerunning) return;

	ball.x += ball.speedX;
	ball.y += ball.speedY;
	if (ball.y < 0 || ball.y > 800) ball.speedY *= -1;

	const hitLeft = ball.x - ball.radius < leftPaddle.x + paddleWidth && ball.y > leftPaddle.y && ball.y < leftPaddle.y + paddleHeight;
	const hitRight = ball.x + ball.radius > rightPaddle.x && ball.y > rightPaddle.y && ball.y < rightPaddle.y + paddleHeight;

	if (hitLeft || hitRight) {
		ball.speedX *= -1;
		ballRotation += BALL_SPIN_STEP;
	}
				
	// Score (on passe la direction du prochain service)
	if (ball.x < 0) {
		score.right++;
		// user2.score++;
		resetBall(1);   // relance vers le joueur 1 (à droite)
	}
	if (ball.x > 1400) {
		score.left++;
		// user1.score++;
		resetBall(-1);  // relance vers le joueur 2 (à gauche)
	}

	// Accélération progressive uniquement si la balle est en mouvement
	if (ball.speedX !== 0 || ball.speedY !== 0) {
		ball.speedX *= 1.0005;
		ball.speedY *= 1.0005;

		// Envoyer l'état du jeu à tous les clients
		const gameState = { ball, leftPaddle, rightPaddle, score };
		app.websocketServer.clients.forEach((client) => {
			if (client.readyState === 1) {
					client.send(JSON.stringify(gameState));
			}
		});
	}

	endGame();
}

app.register(async function (app) {
	app.get('/ws', { websocket: true }, async (socket, request) => {
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

		let playerPosition = null;
        let playerUsername = "Player";
        
        // Assigner une position au joueur
        if (!players.left) {
            playerPosition = 'left';
            players.left = socket;
            console.log('Joueur gauche connecté');
        } else if (!players.right) {
            playerPosition = 'right';
            players.right = socket;
            console.log('Joueur droit connecté');
            
            // Démarrer le jeu quand les deux joueurs sont connectés
            setTimeout(() => {
                resetBall();
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
        const initialGameState = { ball, leftPaddle, rightPaddle, score };
        socket.send(JSON.stringify(initialGameState));

		socket.on('message', async (message) => {
            try {
                const messageData = JSON.parse(message.toString());
                console.log('Message reçu:', messageData);

                // Récupérer le username si fourni
                if (messageData.event === 'join' && messageData.username) {
                    playerUsername = messageData.username;
                    
                    // Informer l'autre joueur
                    const otherPlayer = playerPosition === 'left' ? players.right : players.left;
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
                        if (messageData.direction === 'up' && leftPaddle.y > 2) {
                            leftPaddle.y -= speed;
                        } else if (messageData.direction === 'down' && leftPaddle.y + paddleHeight < 800 - 2) {
                            leftPaddle.y += speed;
                        }
                    } else if (playerPosition === 'right') {
                        if (messageData.direction === 'up' && rightPaddle.y > 2) {
                            rightPaddle.y -= speed;
                        } else if (messageData.direction === 'down' && rightPaddle.y + paddleHeight < 800 - 2) {
                            rightPaddle.y += speed;
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
                players.left = null;
            } else if (playerPosition === 'right') {
                players.right = null;
            }
            
            // Réinitialiser le jeu si un joueur part
            resetGame();
        });

        socket.on('error', (error) => {
            console.error('Erreur WebSocket:', error);
        });
    });
});

setInterval(updateGame, 1000 / 60);

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
