import app from '../dist/app.js';
import { connectRedis } from '../dist/config/redis.config.js';
import '../dist/utils/bigint-json.js';

let redisReady = null;

function ensureRedisReady() {
  if (!redisReady) {
    redisReady = connectRedis().catch((error) => {
      redisReady = null;
      throw error;
    });
  }

  return redisReady;
}

export default async function handler(req, res) {
  await ensureRedisReady();
  return app(req, res);
}
