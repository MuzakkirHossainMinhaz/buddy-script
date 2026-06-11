import type { NextFunction, Request, Response } from 'express';
import { logger } from '../config/logger.config.js';

const SENSITIVE_HEADERS = new Set(['authorization', 'cookie', 'set-cookie']);
const SENSITIVE_BODY_FIELDS = new Set(['password', 'confirmPassword', 'currentPassword', 'newPassword', 'token', 'secret']);

/**
 * Sanitize headers by redacting sensitive values.
 */
function sanitizeHeaders(headers: Record<string, string | string[] | undefined>): Record<string, string | string[] | undefined> {
  const sanitized: Record<string, string | string[] | undefined> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (SENSITIVE_HEADERS.has(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Sanitize request body by redacting sensitive fields.
 */
function sanitizeBody(body: unknown): unknown {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
    if (SENSITIVE_BODY_FIELDS.has(key)) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Request/response logging middleware using Winston.
 * Logs method, URL, status code, and response time.
 * Redacts sensitive headers and body fields.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startTime = process.hrtime.bigint();

  // Log incoming request at debug level
  logger.debug('Incoming request', {
    method: req.method,
    url: req.originalUrl,
    headers: sanitizeHeaders(req.headers as Record<string, string | string[] | undefined>),
    body: req.method !== 'GET' ? sanitizeBody(req.body) : undefined,
    ip: req.ip,
  });

  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const responseTimeMs = Number(endTime - startTime) / 1_000_000;

    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${responseTimeMs.toFixed(2)}ms`,
      contentLength: res.get('content-length'),
    };

    const logMessage = `HTTP ${req.method} ${req.originalUrl} ${res.statusCode} ${responseTimeMs.toFixed(2)}ms`;

    if (res.statusCode >= 500) {
      logger.error(logMessage, logData);
    } else if (res.statusCode >= 400) {
      logger.warn(logMessage, logData);
    } else {
      logger.info(logMessage, logData);
    }
  });

  next();
}
