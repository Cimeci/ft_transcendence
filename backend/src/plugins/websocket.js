import fastify from "fastify";
import websocket from "@fastify/websocket";
import jwt from "@fastify/jwt";
import dotenv from 'dotenv'

dotenv.config();

const app = fastify({ logger: true });

app.post({})
app.listen({ port: 4000, host: '0.0.0.0.0' });