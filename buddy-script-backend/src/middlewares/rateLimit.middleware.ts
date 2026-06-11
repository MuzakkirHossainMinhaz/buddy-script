import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { ioRedisClient } from '../config/redis.config.js';

const FIFTEEN_MINUTES = 15 * 60 * 1000;

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
 * 100 requests per 15-minute window.
 */
export const apiRateLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  max: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args: string[]) => (ioRedisClient as any).call(...args) as never,
    prefix: 'rl:api:',
  }),
  message: { success: false, error: 'Too many requests, please try again later' },
  skipSuccessfulRequests: false,
});
