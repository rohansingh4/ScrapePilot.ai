import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { HTTPException } from 'hono/http-exception';
import { scrapeRequestSchema } from '@scrapepilot/shared';
import { User } from '@scrapepilot/database';
import { apiKeyMiddleware } from '../middleware/auth.middleware.js';
import { rateLimitMiddleware } from '../middleware/rate-limit.middleware.js';
import { scrape, calculateCredits } from '../services/scraper/scraper-factory.js';
import {
  extractData,
  extractWithPrompt,
  detectExtractableData,
  htmlToMarkdown,
  toCSV,
  toJSON,
  isAIConfigured,
  getAIProviderInfo,
} from '../services/ai/extractor.js';

const scrapeRoutes = new Hono();

// All routes require API key authentication and rate limiting
scrapeRoutes.use('*', apiKeyMiddleware);
scrapeRoutes.use('*', rateLimitMiddleware);

// POST /v1/scrape - Synchronous scrape with all features
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

  // Extract data with AI
  let extractedData: Record<string, unknown> | undefined;
  let aiExtraction: { data: unknown; format: string; confidence: number } | undefined;

  // Schema-based extraction
  if (body.extractSchema) {
    extractedData = await extractData(result.html, body.extractSchema);
  }

  // Natural language extraction (new feature!)
  if (body.extractPrompt) {
    aiExtraction = await extractWithPrompt(result.html, body.extractPrompt);
  }

  // Generate markdown if requested
  const markdown = body.exportFormat === 'markdown' ? htmlToMarkdown(result.html) : undefined;

  // Prepare response based on export format
  const responseData = {
    url: result.url,
    finalUrl: result.finalUrl,
    statusCode: result.statusCode,
    html: body.exportFormat !== 'markdown' ? result.html : undefined,
    text: result.text,
    markdown,
    data: extractedData,
    aiExtraction,
    screenshot: 'screenshot' in result ? result.screenshot : undefined,
    pdf: 'pdf' in result ? result.pdf : undefined,
    actionResults: 'actionResults' in result ? result.actionResults : undefined,
    metadata: result.metadata,
    metrics: {
      loadTime: result.loadTime,
      renderTime: 'renderTime' in result ? result.renderTime : undefined,
      size: result.size,
      creditsUsed: creditsRequired,
    },
  };

  // Handle export format
  if (body.exportFormat === 'csv' && aiExtraction?.data) {
    return c.text(toCSV(aiExtraction.data), 200, {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="scraped-data.csv"',
    });
  }

  if (body.exportFormat === 'json' && aiExtraction?.data) {
    return c.text(toJSON(aiExtraction.data), 200, {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="scraped-data.json"',
    });
  }

  return c.json({
    success: true,
    data: responseData,
  });
});

// POST /v1/scrape/extract - AI extraction endpoint
scrapeRoutes.post('/extract', zValidator('json', scrapeRequestSchema), async (c) => {
  const body = c.req.valid('json');
  const user = c.get('user');

  if (!body.extractSchema && !body.extractPrompt) {
    throw new HTTPException(400, { message: 'Either extractSchema or extractPrompt is required' });
  }

  // Check credits (AI extraction costs extra)
  const creditsRequired = calculateCredits(body);
  if (user.credits < creditsRequired) {
    throw new HTTPException(402, { message: 'Insufficient credits' });
  }

  // Perform scrape
  const result = await scrape(body.url, body);

  // Deduct credits
  await User.updateOne({ _id: user._id }, { $inc: { credits: -creditsRequired } });

  // Perform extraction
  let extractedData: unknown;
  let format: string = 'object';
  let confidence: number = 1;

  if (body.extractPrompt) {
    // Natural language extraction
    const aiResult = await extractWithPrompt(result.html, body.extractPrompt);
    if (aiResult) {
      extractedData = aiResult.data;
      format = aiResult.format;
      confidence = aiResult.confidence;
    }
  } else if (body.extractSchema) {
    // Schema-based extraction
    extractedData = await extractData(result.html, body.extractSchema);
  }

  return c.json({
    success: true,
    data: {
      url: result.url,
      finalUrl: result.finalUrl,
      extracted: extractedData,
      format,
      confidence,
      metadata: result.metadata,
      metrics: {
        loadTime: result.loadTime,
        size: result.size,
        creditsUsed: creditsRequired,
      },
    },
  });
});

// POST /v1/scrape/detect - AI auto-detection of extractable data
scrapeRoutes.post('/detect', zValidator('json', scrapeRequestSchema.pick({ url: true, renderMode: true, timeout: true })), async (c) => {
  const body = c.req.valid('json');
  const user = c.get('user');

  if (!isAIConfigured()) {
    throw new HTTPException(503, { message: 'AI extraction not configured' });
  }

  // Check credits
  if (user.credits < 2) {
    throw new HTTPException(402, { message: 'Insufficient credits' });
  }

  // Perform quick scrape
  const result = await scrape(body.url, { ...body, renderMode: body.renderMode || 'http' });

  // Deduct credits
  await User.updateOne({ _id: user._id }, { $inc: { credits: -2 } });

  // Detect extractable data
  const suggestions = await detectExtractableData(result.html);

  return c.json({
    success: true,
    data: {
      url: result.url,
      title: result.metadata.title,
      suggestions: suggestions?.suggestions || [],
      aiProvider: getAIProviderInfo(),
    },
  });
});

// POST /v1/scrape/screenshot - Scrape with screenshot
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

// GET /v1/scrape/export/:format - Export endpoint for downloading data
scrapeRoutes.post('/export/:format', zValidator('json', scrapeRequestSchema), async (c) => {
  const format = c.req.param('format');
  const body = c.req.valid('json');
  const user = c.get('user');

  if (!['json', 'csv', 'markdown'].includes(format)) {
    throw new HTTPException(400, { message: 'Invalid format. Use: json, csv, or markdown' });
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

  // Extract data if prompt provided
  let data: unknown = null;
  if (body.extractPrompt) {
    const aiResult = await extractWithPrompt(result.html, body.extractPrompt);
    data = aiResult?.data;
  } else if (body.extractSchema) {
    data = await extractData(result.html, body.extractSchema);
  }

  // Format and return
  switch (format) {
    case 'csv':
      if (!data || !Array.isArray(data)) {
        throw new HTTPException(400, { message: 'CSV export requires array data. Use extractPrompt to extract a list.' });
      }
      return c.text(toCSV(data), 200, {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${new URL(body.url).hostname}-data.csv"`,
      });

    case 'markdown':
      return c.text(htmlToMarkdown(result.html), 200, {
        'Content-Type': 'text/markdown',
        'Content-Disposition': `attachment; filename="${new URL(body.url).hostname}.md"`,
      });

    case 'json':
    default:
      return c.text(toJSON(data || { html: result.html, text: result.text, metadata: result.metadata }), 200, {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${new URL(body.url).hostname}-data.json"`,
      });
  }
});

// GET /v1/scrape/ai/status - Check AI configuration
scrapeRoutes.get('/ai/status', async (c) => {
  return c.json({
    success: true,
    data: getAIProviderInfo(),
  });
});

export default scrapeRoutes;
