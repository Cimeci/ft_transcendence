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
app.register(async function (app) {
  app.get('/ws', { websocket: true }, async (socket, request) => {
    console.log('Client connecté');

    socket.on('message', async (message) => {
      console.log('Message reçu du client :', message);
      const messageData = JSON.parse(message.toString());

      try {
        let response;
        if (messageData.service === 'A') {
          response = await fetch('http://auth:4000/handle-message', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(messageData)
          });
        } else if (messageData.service === 'B') {
          response = await fetch('http://game:4000/handle-message', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(messageData)
          });
        } else {
          socket.send(JSON.stringify({ error: 'Service inconnu' }));
          return;
        }

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