import { ioRedisClient } from '../config/redis.config.js';
import { logger } from '../config/logger.config.js';

/**
 * Redis caching service providing get-or-set semantics,
 * key deletion, and pattern-based cache invalidation.
 */
export class CacheService {
  /**
   * Retrieve a value from cache by key. If not present, compute it
   * via `fetchFn`, store the result with the given TTL, and return it.
   *
   * Falls back to `fetchFn` on any Redis error so the app
   * continues to work even when the cache is unavailable.
   *
   * @param key - The Redis key to look up / store under
   * @param ttlSeconds - Time-to-live in seconds for the cached value
   * @param fetchFn - Async function that produces the value on a cache miss
   * @returns The cached or freshly-fetched value
   */
  async getOrSet<T>(key: string, ttlSeconds: number, fetchFn: () => Promise<T>): Promise<T> {
    try {
      const cached = await ioRedisClient.get(key);
      if (cached) {
        return JSON.parse(cached) as T;
      }
      const data = await fetchFn();
      await ioRedisClient.setex(
        key,
        ttlSeconds,
        JSON.stringify(data, (_key: string, value: unknown) =>
          typeof value === 'bigint' ? value.toString() : value,
        ),
      );
      return data;
    } catch (error) {
      logger.warn('Cache error, falling back to fetch', { key, error });
      return fetchFn();
    }
  }

  /**
   * Read a small integer namespace version used to make cache invalidation O(1).
   */
  async getNamespaceVersion(namespace: string): Promise<number> {
    try {
      const version = await ioRedisClient.get(`${namespace}:version`);
      return version ? parseInt(version, 10) || 1 : 1;
    } catch (error) {
      logger.warn('Cache namespace version read failed', { namespace, error });
      return 1;
    }
  }

  /**
   * Bump a namespace version instead of scanning and deleting every matching key.
   */
  async bumpNamespaceVersion(namespace: string): Promise<void> {
    try {
      await ioRedisClient.incr(`${namespace}:version`);
    } catch (error) {
      logger.warn('Cache namespace version bump failed', { namespace, error });
    }
  }

  /**
   * Delete a single key from the cache.
   */
  async del(key: string): Promise<void> {
    try {
      await ioRedisClient.del(key);
    } catch (error) {
      logger.warn('Cache delete failed', { key, error });
    }
  }

  /**
   * Invalidate all keys matching a glob-style pattern using
   * incremental SCAN so we never block Redis with a KEYS command.
   *
   * @param pattern - Glob pattern (e.g. `posts:*`)
   */
  async invalidate(pattern: string): Promise<void> {
    try {
      let cursor = '0';
      do {
        const [nextCursor, keys] = await ioRedisClient.scan(
          cursor,
          'MATCH',
          pattern,
          'COUNT',
          100,
        );
        cursor = nextCursor;
        if (keys.length > 0) {
          await ioRedisClient.del(...keys);
        }
      } while (cursor !== '0');
    } catch (error) {
      logger.warn('Cache invalidation failed', { pattern, error });
    }
  }
}

export const cacheService = new CacheService();
