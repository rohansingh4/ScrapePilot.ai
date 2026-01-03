import type { ErrorHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { ZodError } from 'zod';
import { logger } from '../utils/logger.js';

interface MongoError extends Error {
  code?: number;
}

/**
 * Global error handler for Hono
 */
export const errorHandler: ErrorHandler = (err, c) => {
  logger.error({ err }, 'Error occurred');

  // Zod validation errors
  if (err instanceof ZodError) {
    return c.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: err.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
      },
      400
    );
  }

  // HTTP exceptions
  if (err instanceof HTTPException) {
    return c.json(
      {
        success: false,
        error: {
          code: err.message.toUpperCase().replace(/\s+/g, '_'),
          message: err.message,
        },
      },
      err.status
    );
  }

  // MongoDB duplicate key error
  const mongoErr = err as MongoError;
  if (mongoErr.name === 'MongoServerError' && mongoErr.code === 11000) {
    return c.json(
      {
        success: false,
        error: {
          code: 'DUPLICATE_ERROR',
          message: 'Resource already exists',
        },
      },
      409
    );
  }

  // Default error
  return c.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
      },
    },
    500
  );
};
