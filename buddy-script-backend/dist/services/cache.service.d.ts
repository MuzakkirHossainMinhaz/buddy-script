/**
 * Redis caching service providing get-or-set semantics,
 * key deletion, and pattern-based cache invalidation.
 */
export declare class CacheService {
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
    getOrSet<T>(key: string, ttlSeconds: number, fetchFn: () => Promise<T>): Promise<T>;
    /**
     * Delete a single key from the cache.
     */
    del(key: string): Promise<void>;
    /**
     * Invalidate all keys matching a glob-style pattern using
     * incremental SCAN so we never block Redis with a KEYS command.
     *
     * @param pattern - Glob pattern (e.g. `posts:*`)
     */
    invalidate(pattern: string): Promise<void>;
}
export declare const cacheService: CacheService;
//# sourceMappingURL=cache.service.d.ts.map