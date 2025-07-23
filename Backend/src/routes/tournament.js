import { createTournament, tournamentResponse } from "../schemas/tournament.schema.js";

export default async function (fastify, opts) {
    fastify.post('/tournament', {
        schema: {
            body: createTournament,
            response: {
                201: tournamentResponse
            }
        }
    }, async (request, reply) => {
        const { name, member } = request.body;

        // Ici tu pourrais insérer dans la DB ou juste retourner les données reçues

        reply.code(201).send ({
            message: 'tournoi cree',
            data: { name, member}
        });
    });
}