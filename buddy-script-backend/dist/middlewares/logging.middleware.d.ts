import type { NextFunction, Request, Response } from 'express';
/**
 * Request/response logging middleware using Winston.
 * Logs method, URL, status code, and response time.
 * Redacts sensitive headers and body fields.
 */
export declare function requestLogger(req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=logging.middleware.d.ts.map