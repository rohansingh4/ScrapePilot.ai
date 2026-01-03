import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { HTTPException } from 'hono/http-exception';
import { scrapeRequestSchema } from '@scrapepilot/shared';
import { User } from '@scrapepilot/database';
import { apiKeyMiddleware } from '../middleware/auth.middleware.js';
import { rateLimitMiddleware } from '../middleware/rate-limit.middleware.js';
import { scrape, calculateCredits } from '../services/scraper/scraper-factory.js';
import { extractData } from '../services/ai/extractor.js';

const scrapeRoutes = new Hono();

// All routes require API key authentication and rate limiting
scrapeRoutes.use('*', apiKeyMiddleware);
scrapeRoutes.use('*', rateLimitMiddleware);

// POST /v1/scrape - Synchronous scrape
scrapeRoutes.post('/', zValidator('json', scrapeRequestSchema), async (c) => {
  const body = c.req.valid('json');
  const user = c.get('user');

  // Check credits
  const creditsRequired = calculateCredits(body);
  if (user.credits < creditsRequired) {
    throw new HTTPException(402, { message: 'Insufficient credits' });
  }

  // Perform scrape
  const result = await scrape(body.url, body);

  // Deduct credits
  await User.updateOne({ _id: user._id }, { $inc: { credits: -creditsRequired } });

  // Extract data with AI if schema provided
  let extractedData: Record<string, unknown> | undefined;
  if (body.extractSchema) {
    extractedData = await extractData(result.html, body.extractSchema);
  }

  return c.json({
    success: true,
    data: {
      url: result.url,
      finalUrl: result.finalUrl,
      statusCode: result.statusCode,
      html: result.html,
      text: result.text,
      data: extractedData,
      screenshot: 'screenshot' in result ? result.screenshot : undefined,
      pdf: 'pdf' in result ? result.pdf : undefined,
      metadata: result.metadata,
      metrics: {
        loadTime: result.loadTime,
        renderTime: 'renderTime' in result ? result.renderTime : undefined,
        size: result.size,
        creditsUsed: creditsRequired,
      },
    },
  });
});

// POST /v1/scrape/screenshot - Scrape with screenshot (convenience endpoint)
scrapeRoutes.post('/screenshot', zValidator('json', scrapeRequestSchema), async (c) => {
  const body = c.req.valid('json');
  const user = c.get('user');

  // Force screenshot and browser mode
  const config = { ...body, screenshot: true, renderMode: 'browser' as const };

  // Check credits
  const creditsRequired = calculateCredits(config);
  if (user.credits < creditsRequired) {
    throw new HTTPException(402, { message: 'Insufficient credits' });
  }

  // Perform scrape
  const result = await scrape(config.url, config);

  // Deduct credits
  await User.updateOne({ _id: user._id }, { $inc: { credits: -creditsRequired } });

  return c.json({
    success: true,
    data: {
      url: result.url,
      finalUrl: result.finalUrl,
      statusCode: result.statusCode,
      html: result.html,
      text: result.text,
      screenshot: 'screenshot' in result ? result.screenshot : undefined,
      metadata: result.metadata,
      metrics: {
        loadTime: result.loadTime,
        renderTime: 'renderTime' in result ? result.renderTime : undefined,
        size: result.size,
        creditsUsed: creditsRequired,
      },
    },
  });
});

// POST /v1/scrape/extract - Scrape with AI extraction (convenience endpoint)
scrapeRoutes.post('/extract', zValidator('json', scrapeRequestSchema), async (c) => {
  const body = c.req.valid('json');
  const user = c.get('user');

  if (!body.extractSchema) {
    throw new HTTPException(400, { message: 'extractSchema is required for this endpoint' });
  }

  // Check credits
  const creditsRequired = calculateCredits(body);
  if (user.credits < creditsRequired) {
    throw new HTTPException(402, { message: 'Insufficient credits' });
  }

  // Perform scrape
  const result = await scrape(body.url, body);

  // Deduct credits
  await User.updateOne({ _id: user._id }, { $inc: { credits: -creditsRequired } });

  // Extract data with AI
  const extractedData = await extractData(result.html, body.extractSchema);

  return c.json({
    success: true,
    data: {
      url: result.url,
      finalUrl: result.finalUrl,
      data: extractedData,
      metadata: result.metadata,
      metrics: {
        loadTime: result.loadTime,
        size: result.size,
        creditsUsed: creditsRequired,
      },
    },
  });
});

export default scrapeRoutes;
