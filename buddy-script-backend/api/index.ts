import app from '../src/app.js';
import { connectRedis } from '../src/config/redis.config.js';
import '../src/utils/bigint-json.js';

let redisReady: Promise<void> | null = null;

function ensureRedisReady() {
  if (!redisReady) {
    redisReady = connectRedis().catch((error) => {
      redisReady = null;
      throw error;
    });
  }

  return redisReady;
}

export default async function handler(req: any, res: any) {
  await ensureRedisReady();
  return app(req, res);
}
