import { serve } from '@hono/node-server';
import { createApp } from './app.js';
import { config } from './config/index.js';
import { connectDatabase, disconnectDatabase, initRedis, disconnectRedis } from '@scrapepilot/database';
import { closeQueue } from './services/queue/queue.js';
import { closeBrowser } from './services/scraper/browser-scraper.js';
import { logger } from './utils/logger.js';

async function main() {
  try {
    // Connect to databases
    await connectDatabase({ uri: config.MONGODB_URI });
    initRedis({ url: config.REDIS_URL });

    const app = createApp();

    const server = serve(
      {
        fetch: app.fetch,
        port: config.PORT,
      },
      (info) => {
        logger.info(`Server running on http://localhost:${info.port}`);
        logger.info(`Environment: ${config.NODE_ENV}`);
        logger.info(`Frontend URL: ${config.FRONTEND_URL}`);
      }
    );

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received, shutting down gracefully...`);

      try {
        server.close();
        await closeQueue();
        await closeBrowser();
        await disconnectRedis();
        await disconnectDatabase();

        logger.info('Cleanup complete, exiting');
        process.exit(0);
      } catch (error) {
        logger.error({ error }, 'Error during shutdown');
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
}

main();
