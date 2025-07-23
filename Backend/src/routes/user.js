import { userSignupSchema, userResponseSchema } from "../schemas/user.schema.js";

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
}