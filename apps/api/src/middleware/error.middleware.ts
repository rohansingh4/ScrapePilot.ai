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

  // Playwright/Browser errors
  if (err.message?.includes('Browser') || err.message?.includes('playwright') || err.message?.includes('Chromium')) {
    return c.json(
      {
        success: false,
        error: {
          code: 'BROWSER_ERROR',
          message: err.message || 'Browser scraping failed',
        },
      },
      500
    );
  }

  // Navigation/scraping errors
  if (err.message?.includes('Failed to load page') || err.message?.includes('Navigation')) {
    return c.json(
      {
        success: false,
        error: {
          code: 'SCRAPE_ERROR',
          message: err.message || 'Failed to scrape page',
        },
      },
      500
    );
  }

  // Default error - include message in development
  const isDev = process.env.NODE_ENV === 'development';
  return c.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: isDev && err.message ? err.message : 'Internal server error',
      },
    },
    500
  );
};
