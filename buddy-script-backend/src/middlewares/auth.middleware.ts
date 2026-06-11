import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';
import { UnauthorizedError } from '../utils/errors.js';
import { logger } from '../config/logger.config.js';

interface AuthenticatedUser {
  id: bigint;
  uuid: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  isVerified: boolean;
}

// Augment express-session to include userId
declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}

// Augment Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

async function fetchSessionUser(userId: string): Promise<AuthenticatedUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: BigInt(userId) },
    select: {
      id: true,
      uuid: true,
      firstName: true,
      lastName: true,
      email: true,
      isActive: true,
      isVerified: true,
    },
  });

  return user;
}

/**
 * Middleware that requires authentication.
 * Throws UnauthorizedError if no valid session or user is found.
 */
export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.session?.userId;

    if (!userId) {
      throw new UnauthorizedError('Authentication required');
    }

    const user = await fetchSessionUser(userId);

    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account has been deactivated');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      logger.error('Auth middleware error', { error });
      next(new UnauthorizedError('Authentication required'));
    }
  }
}

/**
 * Middleware that optionally attaches user data if a valid session exists.
 * Does NOT throw if session is missing — sets req.user to undefined instead.
 */
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.session?.userId;

    if (!userId) {
      req.user = undefined;
      next();
      return;
    }

    const user = await fetchSessionUser(userId);

    if (!user || !user.isActive) {
      req.user = undefined;
      next();
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    logger.warn('Optional auth middleware error, continuing unauthenticated', { error });
    req.user = undefined;
    next();
  }
}
