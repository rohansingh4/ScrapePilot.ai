import { config } from '../config/index.js';
import { connectDatabase, disconnectDatabase, initRedis, disconnectRedis } from '@scrapepilot/database';
import { startWorker, closeQueue } from '../services/queue/queue.js';
import { closeBrowser } from '../services/scraper/browser-scraper.js';
import { logger } from '../utils/logger.js';

async function main() {
  try {
    logger.info('Starting scrape worker...');

    // Connect to databases
    await connectDatabase({ uri: config.MONGODB_URI });
    initRedis({ url: config.REDIS_URL });

    // Start the worker
    const worker = startWorker();

    logger.info({
      concurrency: config.WORKER_CONCURRENCY,
      environment: config.NODE_ENV,
    }, 'Scrape worker running');

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received, shutting down worker...`);

      try {
        await closeQueue();
        await closeBrowser();
        await disconnectRedis();
        await disconnectDatabase();

        logger.info('Worker shutdown complete');
        process.exit(0);
      } catch (error) {
        logger.error({ error }, 'Error during worker shutdown');
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Keep the process running
    process.stdin.resume();
  } catch (error) {
    logger.error({ error }, 'Failed to start worker');
    process.exit(1);
  }
}

main();
