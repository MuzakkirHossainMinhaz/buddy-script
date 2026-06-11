import type { ErrorRequestHandler } from 'express';
import { z } from 'zod';
import { Prisma } from '../generated/client.js';
import { AppError } from '../utils/errors.js';
import { logger } from '../config/logger.config.js';

interface ErrorResponseBody {
  success: false;
  error: string;
  details?: Record<string, string[]> | string[];
}

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Global error handler for Express 5.
 * Handles AppError, ZodError, Prisma errors, and unknown errors.
 */
export const errorHandler: ErrorRequestHandler = (err, req, res, _next): void => {
  // Log the error
  if (isProduction) {
    logger.error('Request error', {
      method: req.method,
      url: req.originalUrl,
      statusCode: err instanceof AppError ? err.statusCode : 500,
      message: err.message,
    });
  } else {
    logger.error('Request error', {
      method: req.method,
      url: req.originalUrl,
      error: err.message,
      stack: err.stack,
    });
  }

  // Handle known AppError instances
  if (err instanceof AppError) {
    const response: ErrorResponseBody = {
      success: false,
      error: err.message,
    };
    res.status(err.statusCode).json(response);
    return;
  }

  // Handle Zod validation errors
  if (err instanceof z.ZodError) {
    const fieldErrors: Record<string, string[]> = {};

    for (const issue of err.issues) {
      const path = issue.path.length > 0 ? issue.path.join('.') : '_root';
      if (!fieldErrors[path]) {
        fieldErrors[path] = [];
      }
      fieldErrors[path].push(issue.message);
    }

    const response: ErrorResponseBody = {
      success: false,
      error: 'Validation failed',
      details: fieldErrors,
    };
    res.status(400).json(response);
    return;
  }

  // Handle Prisma known request errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': {
        const target = (err.meta?.target as string[]) || [];
        const fields = target.length > 0 ? target.join(', ') : 'field';
        const response: ErrorResponseBody = {
          success: false,
          error: `A record with this ${fields} already exists`,
        };
        res.status(409).json(response);
        return;
      }
      case 'P2025': {
        const response: ErrorResponseBody = {
          success: false,
          error: 'The requested resource was not found',
        };
        res.status(404).json(response);
        return;
      }
      default: {
        const response: ErrorResponseBody = {
          success: false,
          error: isProduction ? 'A database error occurred' : `Database error: ${err.code}`,
        };
        res.status(500).json(response);
        return;
      }
    }
  }

  // Handle Prisma validation errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    const response: ErrorResponseBody = {
      success: false,
      error: isProduction ? 'Invalid data provided' : err.message,
    };
    res.status(400).json(response);
    return;
  }

  // Handle unknown / unexpected errors
  const response: ErrorResponseBody = {
    success: false,
    error: isProduction ? 'Internal server error' : err.message || 'Internal server error',
  };
  res.status(500).json(response);
};
