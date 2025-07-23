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