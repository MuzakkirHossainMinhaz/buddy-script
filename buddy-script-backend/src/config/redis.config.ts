import { createClient, type RedisClientType } from 'redis';
import { Redis } from 'ioredis';
import { RedisStore } from 'connect-redis';
import { logger } from './logger.config.js';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// node-redis client for express-session via connect-redis
const redisClient: RedisClientType = createClient({ url: redisUrl });

redisClient.on('error', (err: Error) => {
  logger.error('node-redis client error', { error: err.message });
});

redisClient.on('connect', () => {
  logger.info('node-redis client connected');
});

redisClient.on('reconnecting', () => {
  logger.warn('node-redis client reconnecting');
});

// ioredis client for rate-limiting and general caching
const ioRedisClient = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
  retryStrategy(times: number): number | null {
    if (times > 10) {
      logger.error('ioredis max retry attempts reached');
      return null;
    }
    const delay = Math.min(times * 200, 5000);
    return delay;
  },
});

ioRedisClient.on('error', (err: Error) => {
  logger.error('ioredis client error', { error: err.message });
});

ioRedisClient.on('connect', () => {
  logger.info('ioredis client connected');
});

ioRedisClient.on('reconnecting', () => {
  logger.warn('ioredis client reconnecting');
});

// Session store backed by node-redis
const redisStore = new RedisStore({
  client: redisClient,
  prefix: 'sess:',
});

async function connectRedis(): Promise<void> {
  try {
    await redisClient.connect();
    logger.info('Redis session client connected successfully');
  } catch (error) {
    logger.error('Failed to connect Redis session client', { error });
    throw error;
  }
}

async function disconnectRedis(): Promise<void> {
  try {
    await redisClient.disconnect();
    ioRedisClient.disconnect();
    logger.info('All Redis clients disconnected successfully');
  } catch (error) {
    logger.error('Error disconnecting Redis clients', { error });
    throw error;
  }
}

export { redisClient, ioRedisClient, redisStore, connectRedis, disconnectRedis };
