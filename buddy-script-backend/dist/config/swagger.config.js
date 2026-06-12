import swaggerJsdoc from 'swagger-jsdoc';
const port = process.env.PORT || 5000;
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Buddy Script Social Media API',
            version: '1.0.0',
            description: 'Secure social media backend API with session-based authentication',
            contact: {
                name: 'Buddy Script Team',
            },
        },
        servers: [
            {
                url: `http://localhost:${port}`,
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                sessionAuth: {
                    type: 'apiKey',
                    in: 'cookie',
                    name: 'sessionId',
                    description: 'Session-based authentication via cookie',
                },
            },
            schemas: {
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        error: { type: 'string' },
                        details: { type: 'object' },
                    },
                },
                SuccessResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        data: { type: 'object' },
                    },
                },
                CursorPaginationMeta: {
                    type: 'object',
                    properties: {
                        limit: { type: 'integer', example: 20 },
                        nextCursor: { type: 'string', nullable: true },
                        hasNext: { type: 'boolean', example: true },
                    },
                },
            },
        },
        security: [
            {
                sessionAuth: [],
            },
        ],
    },
    apis: [
        './src/routes/*.ts',
        './src/controllers/*.ts',
        './dist/routes/*.js',
        './dist/controllers/*.js',
    ],
};
const swaggerSpec = swaggerJsdoc(options);
export { swaggerSpec };
//# sourceMappingURL=swagger.config.js.map