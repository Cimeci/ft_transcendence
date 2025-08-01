import Fastify from 'fastify';
import { port } from './src/config/index.js';
import dbPlugin from './src/plugins/database.js';
import Auth from './src/auth/auth.js';
import Game from './src/game/game.js';
import Tournament from './src/tournament/tournament.js';
import User from './src/user/user.js';

const app = Fastify({ logger: true});

// enregistre le plugin database.js dans Fastify
await app.register(dbPlugin);
Auth.listen({ port: 3001 })
    .then(() => {
        console.log('Auth service running on port 3001');
    })
    .catch ((err) => {
        app.log.error(err);
        process.exit(1);
    });
await app.register(Game);
await app.register(Tournament);
await app.register(User);

// Piège global d’erreur
app.setErrorHandler(async (error, request, reply) => {
  app.log.error(error); // affiche l’erreur dans la console / logs
  reply.status(500).send({ error: 'Internal server error' });
});

//page de base quand on met http://localhost:3000 dans le navigateur
app.get('/', (request, reply) => {
    return {message: 'Salut'}
})

app.listen({ port })
    .then(() => {
        console.log(`✅ Serveur Fastify démarré sur http://localhost:${port}`);
    })
    .catch ((err) => {
        console.error(err)
        process.exit(1)
    });
