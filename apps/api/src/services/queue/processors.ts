import { Job } from 'bullmq';
import { ScrapeJob, ScrapeResult, User } from '@scrapepilot/database';
import type { JobConfig } from '@scrapepilot/shared';
import { scrape, calculateCredits } from '../scraper/scraper-factory.js';
import { extractData } from '../ai/extractor.js';
import { logger } from '../../utils/logger.js';
import type { Types } from 'mongoose';

export interface ScrapeJobData {
  jobId: string;
  userId: string;
  apiKeyId: string;
  url: string;
  config: Partial<JobConfig>;
}

export async function processScrapeJob(job: Job<ScrapeJobData>): Promise<void> {
  const { jobId, userId, url, config } = job.data;

  logger.info({ jobId, url }, 'Processing scrape job');

  const scrapeJob = await ScrapeJob.findById(jobId);
  if (!scrapeJob) {
    throw new Error(`Job ${jobId} not found`);
  }

  // Update job status
  scrapeJob.status = 'processing';
  scrapeJob.metrics.startedAt = new Date();
  await scrapeJob.save();

  try {
    // Perform scrape
    const result = await scrape(url, config);

    // Calculate credits
    const creditsUsed = calculateCredits(config);

    // Deduct credits from user
    await User.updateOne({ _id: userId }, { $inc: { credits: -creditsUsed } });

    // Extract data with AI if schema provided
    let extractedData: Record<string, unknown> | undefined;
    if (config.extractSchema) {
      extractedData = await extractData(result.html, config.extractSchema);
    }

    // Save result
    const scrapeResult = await ScrapeResult.create({
      jobId: scrapeJob._id,
      userId,
      url,
      finalUrl: result.finalUrl,
      statusCode: result.statusCode,
      headers: result.headers,
      html: result.html,
      text: result.text,
      data: extractedData,
      screenshot: 'screenshot' in result ? result.screenshot : undefined,
      pdf: 'pdf' in result ? result.pdf : undefined,
      metadata: result.metadata,
      performance: {
        loadTime: result.loadTime,
        renderTime: 'renderTime' in result ? result.renderTime : undefined,
        size: result.size,
      },
    });

    // Update job as completed
    scrapeJob.status = 'completed';
    scrapeJob.progress = 100;
    scrapeJob.resultId = scrapeResult._id as Types.ObjectId;
    scrapeJob.metrics.completedAt = new Date();
    scrapeJob.metrics.duration = Date.now() - scrapeJob.metrics.queuedAt.getTime();
    scrapeJob.metrics.creditsUsed = creditsUsed;
    await scrapeJob.save();

    logger.info({ jobId, creditsUsed }, 'Scrape job completed successfully');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    scrapeJob.status = 'failed';
    scrapeJob.error = {
      code: 'SCRAPE_FAILED',
      message: errorMessage,
    };
    scrapeJob.metrics.completedAt = new Date();
    scrapeJob.metrics.duration = Date.now() - scrapeJob.metrics.queuedAt.getTime();
    await scrapeJob.save();

    logger.error({ jobId, error: errorMessage }, 'Scrape job failed');
    throw error;
  }
}
