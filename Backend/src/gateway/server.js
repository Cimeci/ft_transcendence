import Fastify from 'fastify'
import fastifyHttpProxy from '@fastify/http-proxy'
import { port } from './config/index.js'

const app = Fastify({ logger: true});

// enregistre le plugin database.js dans Fastify

await app.register(fastifyHttpProxy, {
    upstream: 'http://auth:4000',
    prefix: '/auth',
    rewritePrefix: '' // enleve le prefixe avant d'envoyer
})

await app.register(fastifyHttpProxy, {
    upstream: 'http://game:4000',
    prefix: '/game',
    rewritePrefix: '' // enleve le prefixe avant d'envoyer
})

await app.register(fastifyHttpProxy, {
    upstream: 'http://tournament:4000',
    prefix: '/tournament',
    rewritePrefix: '' // enleve le prefixe avant d'envoyer
})

await app.register(fastifyHttpProxy, {
    upstream: 'http://user:4000',
    prefix: '/user',
    rewritePrefix: '' // enleve le prefixe avant d'envoyer
})

// Piège global d’erreur
app.setErrorHandler(async (error, request, reply) => {
  app.log.error(error); // affiche l’erreur dans la console / logs
  reply.status(500).send({ error: 'Internal server error' });
});

//page de base quand on met http://localhost:3000 dans le navigateur
app.get('/', (request, reply) => {
    return {message: 'Salut'}
})

app.listen({ port: 443, host: '0.0.0.0'})
    .then(() => {
        console.log(`✅ Serveur Fastify démarré sur http://localhost:443`);
    })
    .catch ((err) => {
        console.error(err)
        process.exit(1)
    });
