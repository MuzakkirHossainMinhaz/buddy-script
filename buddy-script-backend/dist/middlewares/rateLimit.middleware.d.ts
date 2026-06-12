/**
 * Strict rate limiter for authentication endpoints.
 * 5 requests per 15-minute window.
 */
export declare const authRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * General rate limiter for API endpoints.
 * 100 requests per 15-minute window.
 */
export declare const apiRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
//# sourceMappingURL=rateLimit.middleware.d.ts.map