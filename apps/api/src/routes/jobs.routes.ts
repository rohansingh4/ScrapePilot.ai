import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { HTTPException } from 'hono/http-exception';
import { scrapeRequestSchema, jobIdSchema, jobListQuerySchema } from '@scrapepilot/shared';
import { ScrapeJob, ScrapeResult } from '@scrapepilot/database';
import { apiKeyMiddleware } from '../middleware/auth.middleware.js';
import { rateLimitMiddleware } from '../middleware/rate-limit.middleware.js';
import { calculateCredits } from '../services/scraper/scraper-factory.js';
import { getScrapeQueue } from '../services/queue/queue.js';

const jobs = new Hono();

// All routes require API key authentication and rate limiting
jobs.use('*', apiKeyMiddleware);
jobs.use('*', rateLimitMiddleware);

// POST /v1/jobs - Create async job
jobs.post('/', zValidator('json', scrapeRequestSchema), async (c) => {
  const body = c.req.valid('json');
  const user = c.get('user');
  const apiKey = c.get('apiKey');

  // Check credits
  const creditsRequired = calculateCredits(body);
  if (user.credits < creditsRequired) {
    throw new HTTPException(402, { message: 'Insufficient credits' });
  }

  // Create job record
  const job = await ScrapeJob.create({
    userId: user._id,
    apiKeyId: apiKey?._id || user._id,
    type: 'scrape',
    url: body.url,
    config: {
      renderMode: body.renderMode || 'http',
      waitFor: body.waitFor || 'load',
      waitForSelector: body.waitForSelector,
      timeout: body.timeout || 30000,
      screenshot: body.screenshot || false,
      pdf: body.pdf || false,
      extractSchema: body.extractSchema,
      headers: body.headers,
      cookies: body.cookies,
    },
    status: 'pending',
    progress: 0,
    metrics: {
      queuedAt: new Date(),
      creditsUsed: 0,
      retries: 0,
    },
  });

  // Add to queue
  const queue = getScrapeQueue();
  await queue.add(
    'scrape',
    {
      jobId: job._id.toString(),
      userId: user._id.toString(),
      apiKeyId: (apiKey?._id || user._id).toString(),
      url: body.url,
      config: job.config,
    },
    {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    }
  );

  return c.json(
    {
      success: true,
      data: {
        jobId: job._id,
        status: job.status,
        url: job.url,
        createdAt: job.createdAt,
      },
      message: 'Job queued successfully',
    },
    202
  );
});

// GET /v1/jobs - List jobs
jobs.get('/', zValidator('query', jobListQuerySchema), async (c) => {
  const user = c.get('user');
  const { page, limit, status, type } = c.req.valid('query');
  const skip = (page - 1) * limit;

  const query: Record<string, unknown> = { userId: user._id };
  if (status) query.status = status;
  if (type) query.type = type;

  const [jobsList, total] = await Promise.all([
    ScrapeJob.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('status progress url config.renderMode metrics.creditsUsed createdAt'),
    ScrapeJob.countDocuments(query),
  ]);

  return c.json({
    success: true,
    data: {
      jobs: jobsList.map((job) => ({
        id: job._id,
        status: job.status,
        progress: job.progress,
        url: job.url,
        renderMode: job.config.renderMode,
        creditsUsed: job.metrics.creditsUsed,
        createdAt: job.createdAt,
      })),
    },
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// GET /v1/jobs/:id - Get job status
jobs.get('/:id', zValidator('param', jobIdSchema), async (c) => {
  const user = c.get('user');
  const { id } = c.req.valid('param');

  const job = await ScrapeJob.findOne({ _id: id, userId: user._id });

  if (!job) {
    throw new HTTPException(404, { message: 'Job not found' });
  }

  return c.json({
    success: true,
    data: {
      jobId: job._id,
      status: job.status,
      progress: job.progress,
      url: job.url,
      config: job.config,
      metrics: job.metrics,
      error: job.error,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    },
  });
});

// GET /v1/jobs/:id/result - Get job result
jobs.get('/:id/result', zValidator('param', jobIdSchema), async (c) => {
  const user = c.get('user');
  const { id } = c.req.valid('param');

  const job = await ScrapeJob.findOne({ _id: id, userId: user._id });

  if (!job) {
    throw new HTTPException(404, { message: 'Job not found' });
  }

  if (job.status !== 'completed') {
    throw new HTTPException(400, { message: `Job is ${job.status}, result not available` });
  }

  const result = await ScrapeResult.findById(job.resultId);

  if (!result) {
    throw new HTTPException(404, { message: 'Result not found' });
  }

  return c.json({
    success: true,
    data: {
      url: result.url,
      finalUrl: result.finalUrl,
      statusCode: result.statusCode,
      html: result.html,
      text: result.text,
      data: result.data,
      screenshot: result.screenshot,
      pdf: result.pdf,
      metadata: result.metadata,
      performance: result.performance,
    },
  });
});

// DELETE /v1/jobs/:id - Cancel job
jobs.delete('/:id', zValidator('param', jobIdSchema), async (c) => {
  const user = c.get('user');
  const { id } = c.req.valid('param');

  const job = await ScrapeJob.findOneAndUpdate(
    { _id: id, userId: user._id, status: 'pending' },
    { status: 'failed', error: { code: 'CANCELLED', message: 'Job cancelled by user' } },
    { new: true }
  );

  if (!job) {
    throw new HTTPException(404, { message: 'Job not found or cannot be cancelled' });
  }

  return c.json({
    success: true,
    message: 'Job cancelled successfully',
  });
});

export default jobs;
