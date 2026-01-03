import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { UsageRecord, ScrapeJob } from '@scrapepilot/database';
import { authMiddleware } from '../middleware/auth.middleware.js';

const usage = new Hono();

// All routes require JWT authentication
usage.use('*', authMiddleware);

const usageQuerySchema = z.object({
  days: z.coerce.number().min(1).max(365).default(30),
});

// GET /v1/usage - Usage summary
usage.get('/', zValidator('query', usageQuerySchema), async (c) => {
  const user = c.get('user');
  const { days } = c.req.valid('query');

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get usage records
  const usageData = await UsageRecord.aggregate([
    {
      $match: {
        userId: user._id,
        timestamp: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: null,
        totalRequests: { $sum: '$requests' },
        successful: { $sum: '$successful' },
        failed: { $sum: '$failed' },
        creditsUsed: { $sum: '$creditsUsed' },
      },
    },
  ]);

  // Get recent jobs
  const recentJobs = await ScrapeJob.find({ userId: user._id })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('status url config.renderMode metrics.creditsUsed createdAt');

  const summary = usageData[0] || {
    totalRequests: 0,
    successful: 0,
    failed: 0,
    creditsUsed: 0,
  };

  return c.json({
    success: true,
    data: {
      period: {
        days,
        start: startDate,
        end: new Date(),
      },
      summary: {
        totalRequests: summary.totalRequests,
        successful: summary.successful,
        failed: summary.failed,
        creditsUsed: summary.creditsUsed,
        successRate:
          summary.totalRequests > 0
            ? ((summary.successful / summary.totalRequests) * 100).toFixed(1)
            : '0',
      },
      recentJobs: recentJobs.map((job) => ({
        id: job._id,
        status: job.status,
        url: job.url,
        renderMode: job.config.renderMode,
        creditsUsed: job.metrics.creditsUsed,
        createdAt: job.createdAt,
      })),
    },
  });
});

// GET /v1/usage/credits - Credit balance
usage.get('/credits', async (c) => {
  const user = c.get('user');

  return c.json({
    success: true,
    data: {
      credits: user.credits,
      plan: user.plan,
      resetsAt: user.creditsResetAt,
      rateLimit: user.rateLimit,
    },
  });
});

export default usage;
