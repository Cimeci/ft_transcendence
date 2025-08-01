// import { userLogin, loginResponse } from "./auth.schema.js";

// //recuperation des donne dans le /login
// export default async function (fastify, obts) {
//     fastify.post('/login', {
//         schema: {
//             body: userLogin,
//             response: {
//                 200: loginResponse
//             }
//         }
//     }, async (request, reply) => {
//         const { email, username, password } = request.body;


//         reply.code(200).send({
//             token: 'token',
//             user: { 
//                 id: 1, 
//                 username: username || 'bob', 
//                 email: email ||  'bob@gmail.com' }
//         });
//     });

//     fastify.get('/login', async(request, reply) => {
//         return ('login');
//     })

//     fastify.listen(3001, () => {
//         console.log("serveur");
//     })
// }

import fastify from 'fastify';
import { userLogin, loginResponse } from './auth.schema.js';

const app = fastify({ logger: true });

app.post('/login', {
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

app.setErrorHandler((error, request, reply) => {
    console.error('Error:', error);
    reply.status(500).send({ error: 'Internal Server Error' });
});

app.get('/login', async(request, reply) => {
    return 'login';
});

app.get('/', async(request, reply) => {
    return 'hello world';
});

app.listen({ port: 3000, host: '0.0.0.0' })
    .then(() => {
        console.log('Auth service running on port 3000');
    })
    .catch ((err) => {
        app.log.error(err);
        process.exit(1);
    });

export default app;