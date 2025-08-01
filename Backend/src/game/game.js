import { createGame, gameResponse } from "./game.schema.js";

//recuperation des donne dans le /game
export default async function (fastify, obts) {
    fastify.post('/game', {
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

    fastify.get('/game', async(request, reply) => {
        return ('game');
    })
}