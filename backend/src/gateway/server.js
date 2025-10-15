import fastify from 'fastify'  // Importe la bibliothèque Fastify pour créer le serveur
import fastifyHttpProxy from '@fastify/http-proxy' // Importe le plugin Fastify pour le proxy HTTP
import dotenv from 'dotenv' // Importe la bibliothèque dotenv pour charger les variables d'environnement

// Charge les variables d'environnement depuis le fichier .env
dotenv.config();

// Configuration du logger fastify
// const loggerConfig = {
//     transport: {
//         target: 'pino/file',
//         options: {
//             destination: '/var/log/app/gateway-service.log',
//             mkdir: true
//         }
//     },
//     redact: ['password', 'hash', 'JWT_SECRET', 'uuid'],
//     base: { service: 'gateway'},
//     formatters: { time: () => `,"timestamp":"${new Date().toISOString()}"` }
// }

// const app = fastify({ logger: loggerConfig });
const app = fastify({ logger: true });

// Enregistre le plugin de proxy HTTP pour les services
await app.register(fastifyHttpProxy, {
    upstream: 'http://auth:4000', // URL du service d'authentification
    prefix: '/auth', // Préfixe pour les routes du service d'authentification
    rewritePrefix: '' // enleve le prefixe avant d'envoyer
})
await app.register(fastifyHttpProxy, {
    upstream: 'http://game:4000',
    prefix: '/game',
    rewritePrefix: ''
})
await app.register(fastifyHttpProxy, {
    upstream: 'http://tournament:4000',
    prefix: '/tournament',
    rewritePrefix: ''
})
await app.register(fastifyHttpProxy, {
    upstream: 'http://user:4000',
    prefix: '/user',
    rewritePrefix: ''
})
//await app.register(fastifyHttpProxy, {
    //upstream: 'http://websocket:4000',
    //prefix: '/websocket',
    //rewritePrefix: ''
//})

// Définit un gestionnaire d'erreurs global pour capturer et logger les erreurs
app.setErrorHandler(async (error, request, reply) => {
    request.log.error({ error:error.message, code: error.code, route: request.routerPath }, 'Unhandled Error, Internal server error');
    reply.status(500).send({ error: 'Internal server error' });
});

// Définit une route de base pour tester le serveur
app.get('/', (request, reply) => {
    return {message: 'Salut'}
})

// Lance le serveur sur le port spécifié
app.listen({ port: 4000, host: '0.0.0.0'})
    .then(() => {
        app.log.info({ event: 'server_start' }, 'Serveur Fastify started on http://localhost:4000');
    })
    .catch ((err) => {
        app.log.error({ err, event: 'server_start_failure' }, 'Failed to launch the server');
        process.exit(1) // Termine le processus en cas d'erreur
    });
