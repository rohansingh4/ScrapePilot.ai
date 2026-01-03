import { Queue, Worker, Job } from 'bullmq';
import { getRedisClient } from '@scrapepilot/database';
import { config } from '../../config/index.js';
import { logger } from '../../utils/logger.js';
import { processScrapeJob, type ScrapeJobData } from './processors.js';

const QUEUE_NAME = 'scrape-jobs';

let scrapeQueue: Queue<ScrapeJobData> | null = null;
let scrapeWorker: Worker<ScrapeJobData> | null = null;

export function getScrapeQueue(): Queue<ScrapeJobData> {
  if (!scrapeQueue) {
    const connection = getRedisClient();
    scrapeQueue = new Queue<ScrapeJobData>(QUEUE_NAME, { connection });
    logger.info('Scrape queue initialized');
  }
  return scrapeQueue;
}

export function startWorker(): Worker<ScrapeJobData> {
  if (!scrapeWorker) {
    const connection = getRedisClient();
    scrapeWorker = new Worker<ScrapeJobData>(
      QUEUE_NAME,
      async (job: Job<ScrapeJobData>) => {
        return processScrapeJob(job);
      },
      {
        connection,
        concurrency: config.WORKER_CONCURRENCY,
      }
    );

    scrapeWorker.on('completed', (job) => {
      logger.info({ jobId: job.id }, 'Job completed');
    });

    scrapeWorker.on('failed', (job, error) => {
      logger.error({ jobId: job?.id, error }, 'Job failed');
    });

    scrapeWorker.on('error', (error) => {
      logger.error({ error }, 'Worker error');
    });

    logger.info({ concurrency: config.WORKER_CONCURRENCY }, 'Scrape worker started');
  }
  return scrapeWorker;
}

export async function closeQueue(): Promise<void> {
  if (scrapeWorker) {
    await scrapeWorker.close();
    scrapeWorker = null;
  }
  if (scrapeQueue) {
    await scrapeQueue.close();
    scrapeQueue = null;
  }
  logger.info('Queue closed');
}
