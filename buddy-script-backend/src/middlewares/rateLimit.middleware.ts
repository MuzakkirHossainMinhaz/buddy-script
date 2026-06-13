import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { ioRedisClient } from '../config/redis.config.js';

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const isProduction = process.env.NODE_ENV === 'production';

const parsePositiveInt = (value: string | undefined, fallback: number) => {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

/**
 * Strict rate limiter for authentication endpoints.
 * 5 requests per 15-minute window.
 */
export const authRateLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  max: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args: string[]) => (ioRedisClient as any).call(...args) as never,
    prefix: 'rl:auth:',
  }),
  message: { success: false, error: 'Too many login attempts, please try again later' },
  skipSuccessfulRequests: false,
});

/**
 * General rate limiter for API endpoints.
 * Development runs the frontend and API through the same localhost IP, so the
 * default bucket is intentionally roomier there.
 */
export const apiRateLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  max: parsePositiveInt(process.env.API_RATE_LIMIT_MAX, isProduction ? 300 : 1000),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args: string[]) => (ioRedisClient as any).call(...args) as never,
    prefix: 'rl:api:',
  }),
  message: { success: false, error: 'Too many requests, please try again later' },
  skipSuccessfulRequests: false,
});
