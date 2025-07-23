export const createTournament = {
    type: 'object',
    required: ['name', 'member'],
    properties: {
        name: { type: 'string', maxLength: 12},
        member: { type: 'integer', minimum: 2, maximum: 16 }
    },
    additionalProperties: false,
};

export const tournamentResponse = {
    type: 'object',
    properties: {
        message : { type: 'string'},
        data: {
            type: 'object',
            properties: {
                name: { type: 'string'},
                member: { type: 'integer'}
            },
            required: ['name', 'member']
        }
    },
    required: ['message', 'data'],
}