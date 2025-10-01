import fastify from "fastify";
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
app.register(jwt, { secret: process.env.JWT_SECRET });
app.register(websocket);

const paddleWidth = 10;
const paddleHeight = 120;
const speed = 6;

let ball = { x: 1400 / 2, y: 800 / 2, radius: 20, speedX: 5, speedY: 5 };
let leftPaddle = { x: 10, y: 800 / 2 - paddleHeight / 2 };
let rightPaddle = { x: 1400 - 20, y: 800 / 2 - paddleHeight / 2 };
let ballRotation = 0;

let score = { left: 4, right: 0 };

let launchTimeout; // <-- ajouté
const BALL_SPIN_STEP = Math.PI / 6;

function resetBall(forceDirection = null) {
    // Position centrale
    ball.x = 1400 / 2;
    ball.y = 800 / 2;

    // Stoppe la balle pendant l’attente
    ball.speedX = 0;
    ball.speedY = 0;
    ballRotation = 0;

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
    }, 3000); // 3 secondes d’attente
}

function endGame(socket) {
  if (score.left === 5 || score.right === 5) {
  // fin de parti, envoyer un message de fin
  const finishMessage = { event: 'finish', winner: score.left === 5 ? 'left' : 'right' };
        
  ball = { x: 1400 / 2, y: 800 / 2, radius: 20, speedX: 5, speedY: 5 };
  leftPaddle = { x: 10, y: 800 / 2 - paddleHeight / 2 };
  rightPaddle = { x: 1400 - 20, y: 800 / 2 - paddleHeight / 2 };
  ballRotation = 0;
  score = { left: 4, right: 0 };

  // socket.send(JSON.stringify(finishMessage));
  const gameState = { ball, leftPaddle, rightPaddle, score };
    app.websocketServer.clients.forEach((client) => {
        if (client.readyState === 1) {
            client.send(JSON.stringify(finishMessage));
        }
    }); 
  }
}

function updateGame() {
  // calcul la prochaine position de la balle, a mettre dans une fonction
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

    // const gameState = { ball, leftPaddle, rightPaddle, score };
    //   socket.send(JSON.stringify(gameState));
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
    console.log('Client connecté');

    socket.on('message', async (message) => {
      console.log('Message reçu du client :', message);
      const messageData = JSON.parse(message.toString());
      console.log('Message data :', messageData);
      console.log(ball);
      let { event, paddle, direction } = messageData;
      if (event === 'move' && paddle === 'left') {
        if (direction === 'up' && leftPaddle.y > 2) {
          leftPaddle.y -= speed;
        }
        else if (direction === 'down' && leftPaddle.y + paddleHeight < 800 - 2) {
          leftPaddle.y += speed;
        }
      } 
      else if (paddle === 'move' && paddle === 'right') {
        if (direction === 'up' && rightPaddle.y > 2) {
          rightPaddle.y -= speed;
        }
        else if (direction === 'down' && rightPaddle.y + paddleHeight < 800 - 2) {
          rightPaddle.y += speed;
        }
      }

      // updateGame();
      // endGame(socket);
    });

    socket.on('close', () => {
      ball = { x: 1400 / 2, y: 800 / 2, radius: 20, speedX: 5, speedY: 5 };
      leftPaddle = { x: 10, y: 800 / 2 - paddleHeight / 2 };
      rightPaddle = { x: 1400 - 20, y: 800 / 2 - paddleHeight / 2 };
      ballRotation = 0;
      console.log('Connexion WebSocket fermée');
    });
  });
});

setInterval(updateGame, 1000 / 60);


app.listen({ port: 4000, host: '0.0.0.0' });