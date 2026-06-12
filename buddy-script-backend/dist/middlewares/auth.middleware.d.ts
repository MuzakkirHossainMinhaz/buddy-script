import type { NextFunction, Request, Response } from 'express';
interface AuthenticatedUser {
    id: bigint;
    uuid: string;
    firstName: string;
    lastName: string;
    email: string;
    isActive: boolean;
    isVerified: boolean;
}
declare module 'express-session' {
    interface SessionData {
        userId: string;
    }
}
declare global {
    namespace Express {
        interface Request {
            user?: AuthenticatedUser;
        }
    }
}
/**
 * Middleware that requires authentication.
 * Throws UnauthorizedError if no valid session or user is found.
 */
export declare function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void>;
/**
 * Middleware that optionally attaches user data if a valid session exists.
 * Does NOT throw if session is missing — sets req.user to undefined instead.
 */
export declare function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void>;
export {};
//# sourceMappingURL=auth.middleware.d.ts.map