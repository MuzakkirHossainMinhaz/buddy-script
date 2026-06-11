import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { ValidationError } from '../utils/errors.js';

type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Generic validation middleware factory using Zod schemas.
 * Parses the specified request target (body, query, or params),
 * replaces raw data with the parsed/coerced result on success,
 * and throws a ValidationError with formatted messages on failure.
 */
export const validate = (schema: z.ZodType, target: ValidationTarget = 'body') => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const formattedErrors = result.error.issues.map((issue) => {
        const path = issue.path.length > 0 ? issue.path.join('.') : target;
        return `${path}: ${issue.message}`;
      });

      const errorMessage = formattedErrors.join('; ');
      throw new ValidationError(errorMessage);
    }

    // Replace request target with parsed/coerced data
    switch (target) {
      case 'body':
        req.body = result.data;
        break;
      case 'query':
        (req as unknown as Record<string, any>).query = result.data;
        break;
      case 'params':
        (req as unknown as Record<string, any>).params = result.data;
        break;
    }

    next();
  };
};
