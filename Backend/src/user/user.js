import fastify from "fastify";
import { userSignupSchema, userResponseSchema } from "./user.schema.js";

//recuperation des donne dans le /sigup
export default async function (fastify, opts) {
    fastify.post('/signup', {
        schema: {
            body: userSignupSchema,
            response: {
                201: userResponseSchema,
            }
        }
    }, async (request, reply) => {
        const { username, email, password } = request.body;


    // ... logique d'enregistrement en base ...
    
        return {
            id: 1,
            username,
            email,
            created_at: new Date().toISOString()
        };
    });
    // fastify.get('/users/:username' , async (request, reply) => {
    //     const user = fastify.db.prepare('SELECT * FROM users WHERE username = ?').get(request.params.username);
    //     if (!user)
    //         return reply.status(404).send({error: 'User not found'});
    //     return user;
    // });

    fastify.get('/signup', async(request, reply) => {
        return ('sign');
    })

    //test
    fastify.get('/users/:id' , async (request, reply) => {
        const user = fastify.db.prepare('SELECT * FROM test WHERE id = ?').get(request.params.id);
        if (!user)
            return reply.status(404).send({error: 'User not found'});
        return user;
    });
        

}
