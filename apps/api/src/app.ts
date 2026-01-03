import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { logger as honoLogger } from 'hono/logger';
import { config } from './config/index.js';
import { errorHandler } from './middleware/error.middleware.js';
import {
  authRoutes,
  apiKeysRoutes,
  scrapeRoutes,
  jobsRoutes,
  usageRoutes,
} from './routes/index.js';

export function createApp() {
  const app = new Hono();

  // Global middleware
  app.use('*', secureHeaders());
  app.use(
    '*',
    cors({
      origin: config.FRONTEND_URL,
      credentials: true,
    })
  );
  app.use('*', honoLogger());

  // Health check
  app.get('/health', (c) =>
    c.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
    })
  );

  // Auth routes
  app.route('/auth', authRoutes);

  // API key management
  app.route('/api-keys', apiKeysRoutes);

  // v1 API routes
  app.route('/v1/scrape', scrapeRoutes);
  app.route('/v1/jobs', jobsRoutes);
  app.route('/v1/usage', usageRoutes);

  // Error handling
  app.onError(errorHandler);

  // 404 handler
  app.notFound((c) =>
    c.json(
      {
        success: false,
        error: { code: 'NOT_FOUND', message: 'Resource not found' },
      },
      404
    )
  );

  return app;
}
