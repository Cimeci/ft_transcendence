import Fastify from 'fastify';
import dbPlugin from './src/plugins/database.js';
import Auth from './src/routes/auth.js';
import Game from './src/routes/game.js';
import Tournament from './src/routes/tournament.js';
import User from './src/routes/user.js';

const app = Fastify({ logger: true});

// enregistre le plugin database.js dans Fastify
await app.register(dbPlugin);
await app.register(Auth);
await app.register(Game);
await app.register(Tournament);
await app.register(User);

//aller sur une route precise http://localhost:3000/ping
app.get('/ping', async (request, reply) => {
    return {message: 'pong'};
})

//page de base quand on met http://localhost:3000 dans le navigateur
app.get('/', (request, reply) => {
    return {message: 'Salut'}
})

app.listen({port: 3000})
    .then(() => {
        console.log('✅ Serveur Fastify démarré sur http://localhost:3000');
    })
    .catch ((err) => {
        console.error(err)
        process.exit(1)
    });
