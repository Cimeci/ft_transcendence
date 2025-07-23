import { userLogin, loginResponse } from "../schemas/auth.schema.js";

export default async function (fastify, obts) {
    fastify.post('/login', {
        schema: {
            body: userLogin,
            response: {
                200: loginResponse
            }
        }
    }, async (request, reply) => {
        const { email, username, password } = request.body;


        reply.code(200).send({
            token: 'token',
            user: { 
                id: 1, 
                username: username || 'bob', 
                email: email ||  'bob@gmail.com' }
        });
    });
}