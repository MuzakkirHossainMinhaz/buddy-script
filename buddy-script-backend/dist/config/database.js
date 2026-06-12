import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient } from '../generated/client.js';
import { logger } from './logger.config.js';
const isDevelopment = process.env.NODE_ENV !== 'production';
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
    adapter,
    log: isDevelopment
        ? [
            { emit: 'event', level: 'query' },
            { emit: 'event', level: 'error' },
            { emit: 'event', level: 'warn' },
        ]
        : [
            { emit: 'event', level: 'error' },
            { emit: 'event', level: 'warn' },
        ],
});
prisma.$on('error', (event) => {
    logger.error('Prisma error', { message: event.message, target: event.target });
});
prisma.$on('warn', (event) => {
    logger.warn('Prisma warning', { message: event.message, target: event.target });
});
if (isDevelopment) {
    prisma.$on('query', (event) => {
        logger.debug('Prisma query', {
            query: event.query,
            params: event.params,
            duration: `${event.duration}ms`,
        });
    });
}
async function disconnectDatabase() {
    try {
        await prisma.$disconnect();
        logger.info('Database disconnected successfully');
    }
    catch (error) {
        logger.error('Error disconnecting database', { error });
        throw error;
    }
    finally {
        await pool.end();
    }
}
export { disconnectDatabase, prisma };
//# sourceMappingURL=database.js.map