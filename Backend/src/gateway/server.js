import Fastify from 'fastify'  // Importe la bibliothèque Fastify pour créer le serveur
import fastifyHttpProxy from '@fastify/http-proxy' // Importe le plugin Fastify pour le proxy HTTP
import dotenv from 'dotenv' // Importe la bibliothèque dotenv pour charger les variables d'environnement

// Charge les variables d'environnement depuis le fichier .env
dotenv.config();

// Crée une instance de Fastify avec le logger activé
const app = Fastify({ logger: true});

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

// Définit un gestionnaire d'erreurs global pour capturer et logger les erreurs
app.setErrorHandler(async (error, request, reply) => {
  app.log.error(error); // affiche l’erreur dans la console / logs
  reply.status(500).send({ error: 'Internal server error' });
});

// Définit une route de base pour tester le serveur
app.get('/', (request, reply) => {
    return {message: 'Salut'}
})

// Lance le serveur sur le port spécifié
app.listen({ port: 443, host: '0.0.0.0'})
    .then(() => {
        console.log(`✅ Serveur Fastify démarré sur http://localhost:443`);
    })
    .catch ((err) => {
        console.error(err) // Affiche l'erreur en cas d'échec
        process.exit(1) // Termine le processus en cas d'erreur
    });
