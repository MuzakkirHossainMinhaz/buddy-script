import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient } from '../generated/client.js';
import { logger } from './logger.config.js';
const isDevelopment = process.env.NODE_ENV !== 'production';
const poolMax = parseInt(process.env.DB_POOL_MAX || (isDevelopment ? '10' : '3'), 10);
const writePool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: poolMax,
});
const readPool = new Pool({
    connectionString: process.env.DATABASE_READ_URL || process.env.DATABASE_URL,
    max: poolMax,
});
function createPrismaClient(pool) {
    return new PrismaClient({
        adapter: new PrismaPg(pool),
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
}
const prisma = createPrismaClient(writePool);
const prismaRead = process.env.DATABASE_READ_URL
    ? createPrismaClient(readPool)
    : prisma;
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
        if (prismaRead !== prisma) {
            await prismaRead.$disconnect();
        }
        logger.info('Database disconnected successfully');
    }
    catch (error) {
        logger.error('Error disconnecting database', { error });
        throw error;
    }
    finally {
        await writePool.end();
        if (readPool !== writePool) {
            await readPool.end();
        }
    }
}
export { disconnectDatabase, prisma, prismaRead };
//# sourceMappingURL=database.js.map