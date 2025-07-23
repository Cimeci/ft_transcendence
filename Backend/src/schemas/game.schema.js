export const createGame = {
    type: 'object',
    required: ['player1Id', 'player2Id'],
    properties: {
        player1Id: { type: 'integer' },
        player2Id: { type: 'integer' }
    },
    additionalProperties: false,
};

export const gameResponse = {
    type: 'object',
    required: ['message', 'data'],
    properties: {
        message: { type: 'string' },
        data: {
            type: 'object',
            required: ['player1Id', 'player2Id'],
            properties: {
                player1Id: { type: 'integer' },
                player2Id: { type: 'integer' }
            },
        }
    },
}