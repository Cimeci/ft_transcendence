//permet de savoir ce qu'il faut pout le login
export const userLogin = {
    type: 'object',
    required: ['password'],
    anyOf: [
        { required: ['email']},
        { required: ['username']}
    ],
    properties: {
        email: { type: 'string', format: 'email'},
        username: { type: 'string', minLength: 3, maxLength: 16},
        password: { type: 'string', minLength: 6},
    },
    additionalProperties: false
}

export const loginResponse = {
  type: 'object',
  required: ['token', 'user'],
  properties: {
    token: { type: 'string' },        // JWT ou session id
    user: {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        username: { type: 'string' },
        email: { type: 'string' },
      },
    },
  },
};