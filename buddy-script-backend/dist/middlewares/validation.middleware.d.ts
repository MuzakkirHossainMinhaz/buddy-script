import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
type ValidationTarget = 'body' | 'query' | 'params';
/**
 * Generic validation middleware factory using Zod schemas.
 * Parses the specified request target (body, query, or params),
 * replaces raw data with the parsed/coerced result on success,
 * and throws a ValidationError with formatted messages on failure.
 */
export declare const validate: (schema: z.ZodType, target?: ValidationTarget) => (req: Request, _res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=validation.middleware.d.ts.map