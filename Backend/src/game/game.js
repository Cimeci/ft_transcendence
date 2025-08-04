import fastify from 'fastify';
import { createGame, gameResponse } from "./game.schema.js";

const app = fastify({ logger: true });

app.post('/game', {
    schema: {
        body: createGame,
        response: {
            201: gameResponse
        }
    }
}, async (request, reply) => {
    const { player1Id, player2Id } = request.body;

    reply.code(201).send({
        message: 'game start',
        data: { player1Id, player2Id }
    });
});

app.get('/game', async(request, reply) => {
    return 'game';
})

app.listen({ port: 4000, host: '0.0.0.0' })

export default app;
//recuperation des donne dans le /game
// export default async function (fastify, obts) {
//     fastify.post('/game', {
//         schema: {
//             body: createGame,
//             response: {
//                 201: gameResponse
//             }
//         }
//     }, async (request, reply) => {
//         const { player1Id, player2Id } = request.body;

//         reply.code(201).send({
//             message: 'game start',
//             data: { player1Id, player2Id }
//         });
//     });

//     fastify.get('/game', async(request, reply) => {
//         return ('game');
//     })
// }