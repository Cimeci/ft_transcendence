import fastify from "fastify";
import websocket from "@fastify/websocket";
import jwt from "@fastify/jwt";
import dotenv from 'dotenv'

dotenv.config();

// Configuration du logger fastify
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

app.post({})
app.listen({ port: 4000, host: '0.0.0.0.0' });