import fastify from "fastify";
import fastifyMetrics from 'fastify-metrics'; 
import websocket from "@fastify/websocket";
import jwt from "@fastify/jwt";
import dotenv from 'dotenv'

dotenv.config();

const loggerConfig = {
    transport: {
        target: 'pino/file',
        options: {
            destination: '/var/log/app/websocket-service.log',
            mkdir: true
        }
    },
    redact: ['password', 'hash', 'JWT_SECRET', 'uuid'],
    base: { service: 'websocket'},
    formatters: { time: () => `,"timestamp":"${new Date().toISOString()}"` }
}
const app = fastify({ logger: loggerConfig });

await app.register(fastifyMetrics, { endpoint: '/metrics' });

app.register(jwt, { secret: process.env.JWT_SECRET });
app.register(websocket);

const paddleWidth = 10;
const paddleHeight = 120;
const speed = 8;
let gameuuid = null;
const BALL_SPIN_STEP = Math.PI / 6;

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

    //? Méthode appelée quand un joueur abandonne définitivement (pas pour déconnexion temporaire)
    abandonGame(abandoningPlayer) {
        
        this.ball = { x: 1400 / 2, y: 800 / 2, radius: 20, speedX: 0, speedY: 0 };
        this.leftPaddle = { x: 10, y: 800 / 2 - paddleHeight / 2 };
        this.rightPaddle = { x: 1400 - 20, y: 800 / 2 - paddleHeight / 2 };
        this.isGamerunning = false;
        
        if (this.launchTimeout) {
            clearTimeout(this.launchTimeout);
            this.launchTimeout = null;
        }
        
        // Donner la victoire à l'autre joueur
        if (abandoningPlayer === 'left') {
            this.score.right = 5;
            this.score.left = 0;
        } else {
            this.score.left = 5;
            this.score.right = 0;
        }
        
        const gameState = { 
            ball: this.ball, 
            leftPaddle: this.leftPaddle, 
            rightPaddle: this.rightPaddle, 
            score: this.score, 
            event: 'game_over',
            reason: 'abandon'
        };
        this.clients.forEach((client) => {
            if (client.readyState === 1) {
                client.send(JSON.stringify(gameState));
            }
        });
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
        this.ball.x = 1400 / 2;
        this.ball.y = 800 / 2;

        this.ball.speedX = 0;
        this.ball.speedY = 0;
        this.ballRotation = 0;
    
        const gameState = { ball: this.ball, leftPaddle: this.leftPaddle, rightPaddle: this.rightPaddle, score: this.score };
        this.clients.forEach((client) => {
            if (client.readyState === 1) {
                    client.send(JSON.stringify(gameState));
            }
        });
    
        if (this.launchTimeout !== null) {
                clearTimeout(this.launchTimeout);
        }
    
        const speed = 1400 / 200;
        const maxAngle = Math.PI / 4;
    
        let angle = 0;
        do {
                angle = (Math.random() * 2 - 1) * maxAngle;
        } while (Math.abs(angle) < 0.1);

        const direction = forceDirection ?? (Math.random() < 0.5 ? -1 : 1);
        this.ball.speedX = Math.cos(angle) * speed * direction;
        this.ball.speedY = Math.sin(angle) * speed;
        this.launchTimeout = null;
        this.isGamerunning = true;

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
                    
        // Score
        if (this.ball.x < 0) {
            this.score.right++;
            this.resetBall(1);
        }
        if (this.ball.x > 1400) {
            this.score.left++;
            this.resetBall(-1);
        }
    
        // Accélération progressive
        if (this.ball.speedX !== 0 || this.ball.speedY !== 0) {
            this.ball.speedX *= 1.0005;
            this.ball.speedY *= 1.0005;
    
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

        gameuuid = request.params.uuid;
        if (!games[gameuuid])
            games[gameuuid] = new Game(gameuuid);

        const game = games[gameuuid];
        
		let playerPosition = null;
        let playerUsername = "Player";

        const initialGameState = { ball: game.ball, leftPaddle: game.leftPaddle, rightPaddle: game.rightPaddle, score: game.score };
        socket.send(JSON.stringify(initialGameState));

		socket.on('message', async (message) => {
        try {
            const messageData = JSON.parse(message.toString());

            if (messageData.event === 'join' && messageData.username) {
                playerUsername = messageData.username;
                const playerUuid = messageData.uuid;
                
                try {
                    const data = await fetch(`http://game:4000/game/${gameuuid}`, {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' }
                    })
                    const dataJson = await data.json();

                    if (playerUuid === dataJson.player1_uuid){
                        playerPosition = 'left';
                        game.players.left = socket;
                    } 
                    else {
                        playerPosition = 'right';
                        game.players.right = socket;
                    }
                    game.clients.push(socket);

                    if (game.players.left && game.players.right) {
                        setTimeout(() => {
                            game.resetBall();
                        }, 1000);
                    }

                    socket.send(JSON.stringify({ 
                        event: 'assigned', 
                        position: playerPosition 
                    }));
                } catch (error) {
                    console.error('Erreur fetching game data:', error);
                }
                const otherPlayer = playerPosition === 'left' ? game.players.right : game.players.left;
                if (otherPlayer && otherPlayer.readyState === 1) {
                    otherPlayer.send(JSON.stringify({
                        event: 'opponent_joined',
                        opponentUsername: playerUsername
                    }));
                }
            }

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

            } catch (error) {
                console.error('Erreur parsing message:', error);
            }
        });

        socket.on('close', () => {
            // Ne pas libérer immédiatement - donner 5 secondes pour reconnexion
            setTimeout(() => {
                if ((playerPosition === 'left' && game.players.left === socket) ||
                    (playerPosition === 'right' && game.players.right === socket)) {
                    
                    // Libérer la position
                    if (playerPosition === 'left') {
                        game.players.left = null;
                    } else if (playerPosition === 'right') {
                        game.players.right = null;
                    }
                    
                    game.isGamerunning = false;
                    game.abandonGame(playerPosition);
                }
            }, 5000);
        });

        socket.on('error', (error) => {
            console.error('Erreur WebSocket:', error);
        });
    });
});

app.listen({ port: 4000, host: '0.0.0.0' }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
});
