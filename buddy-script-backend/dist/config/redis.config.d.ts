import { RedisStore } from 'connect-redis';
import { Redis } from 'ioredis';
import { type RedisClientType } from 'redis';
declare const redisClient: RedisClientType;
declare const ioRedisClient: Redis;
declare const redisStore: RedisStore;
declare function connectRedis(): Promise<void>;
declare function disconnectRedis(): Promise<void>;
export { connectRedis, disconnectRedis, ioRedisClient, redisClient, redisStore };
//# sourceMappingURL=redis.config.d.ts.map