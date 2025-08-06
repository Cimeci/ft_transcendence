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

//permet de savoir ce qu'il faut pour le sigup
export const userSignupSchema = {
    type: 'object',
    required: ['username', 'email', 'password'],
    properties: {
        username: { type: 'string', minLength: 3, maxLength: 16},
        email: { type: 'string', format: 'email'},
        password: { type: 'string', minLength: 6},
    },
    additionalProperties: false,
};

export const userResponseSchema = {
    type: 'object',
    properties: {
        id: { type: 'integer'},
        username: { type: 'string'},
        email: { type: 'string'},
        created_at: { type: 'string', format: 'date-time'},
    }
};