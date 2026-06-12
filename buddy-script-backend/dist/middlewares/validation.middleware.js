import { ValidationError } from '../utils/errors.js';
/**
 * Generic validation middleware factory using Zod schemas.
 * Parses the specified request target (body, query, or params),
 * replaces raw data with the parsed/coerced result on success,
 * and throws a ValidationError with formatted messages on failure.
 */
export const validate = (schema, target = 'body') => {
    return (req, _res, next) => {
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
                Object.defineProperty(req, 'query', {
                    value: result.data,
                    writable: true,
                    configurable: true,
                    enumerable: true,
                });
                break;
            case 'params':
                Object.defineProperty(req, 'params', {
                    value: result.data,
                    writable: true,
                    configurable: true,
                    enumerable: true,
                });
                break;
        }
        next();
    };
};
//# sourceMappingURL=validation.middleware.js.map