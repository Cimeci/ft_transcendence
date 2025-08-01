import { createTournament, tournamentResponse } from "./tournament.schema.js";

//recuperation des donne dans le /tournament
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

    fastify.get('/tournament', async (request, reply) => {
        return("page tournament");
    })
}