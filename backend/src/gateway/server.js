import fastify from 'fastify'
import fastifyHttpProxy from '@fastify/http-proxy'
import dotenv from 'dotenv'

dotenv.config();

const loggerConfig = {
    transport: {
        target: 'pino/file',
        options: {
            destination: '/var/log/app/gateway-service.log',
            mkdir: true
        }
    },
    redact: ['password', 'hash', 'JWT_SECRET', 'uuid'],
    base: { service: 'gateway'},
    formatters: { time: () => `,"timestamp":"${new Date().toISOString()}"` }
}

const app = fastify({ logger: loggerConfig });

await app.register(fastifyHttpProxy, {
    upstream: 'http://auth:4000',
    prefix: '/auth',
    rewritePrefix: ''
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

app.setErrorHandler(async (error, request, reply) => {
    request.log.error({ error:error.message, code: error.code, route: request.routerPath }, 'Unhandled Error, Internal server error');
    reply.status(500).send({ error: 'Internal server error' });
});

app.get('/', (request, reply) => {
    return {message: 'Salut'}
})

app.listen({ port: 4000, host: '0.0.0.0'})
    .then(() => {
        app.log.info({ event: 'server_start' }, 'Serveur Fastify started on http://localhost:4000');
    })
    .catch ((err) => {
        app.log.error({ err, event: 'server_start_failure' }, 'Failed to launch the server');
        process.exit(1)
    });
