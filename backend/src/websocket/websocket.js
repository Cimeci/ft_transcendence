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

const start_ball = { x: 1400 / 2, y: 800 / 2, radius: 20, speddX: 5, speedY: 5 };
let leftpaddle = { x: 10, y: 800 / 2 - paddleHeight / 2 };
const rightPaddle = { x: canvas.width - 20, y: 800 / 2 - paddleHeight / 2 };
let ballRotation = 0;

async function startGame() {
  
}
async function resetBall(forceDirection = null) {
    // Position centrale
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;

    // Stoppe la balle pendant l’attente
    ball.speedX = 0;
    ball.speedY = 0;
    ballRotation = 0;

    // Annule un éventuel timer précédent
    if (launchTimeout !== null) {
        clearTimeout(launchTimeout);
    }

    // Vitesse initiale
    const speed = canvas.width / 200;
    const maxAngle = Math.PI / 4;

    // Lance la balle après un délai
    launchTimeout = window.setTimeout(() => {
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

app.register(async function (app) {
  app.get('/ws', { websocket: true }, async (socket, request) => {
    console.log('Client connecté');

    socket.on('message', async (message) => {
      console.log('Message reçu du client :', message);
      const messageData = JSON.parse(message.toString());
      console.log('Message data :', messageData);

      let lplayer, rplayer, ball, score, event, msg, notification;
      try {
        messageData.
        

        const responseData = await response.json();
        socket.send(JSON.stringify(responseData));
      } catch (error) {
        console.error('Erreur lors de la communication avec les services :', error);
        socket.send(JSON.stringify({ error: 'Erreur interne' }));
      }
    });

    socket.on('close', () => {
      console.log('Connexion WebSocket fermée');
    });
  });
});

app.listen({ port: 4000, host: '0.0.0.0' });