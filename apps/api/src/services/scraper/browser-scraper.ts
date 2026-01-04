import { chromium, type Browser, type Page } from 'playwright';
import * as cheerio from 'cheerio';
import type { JobConfig, PageMetadata, WaitFor, BrowserAction } from '@scrapepilot/shared';
import { logger } from '../../utils/logger.js';

let browser: Browser | null = null;

export interface BrowserScrapeResult {
  url: string;
  finalUrl: string;
  statusCode: number;
  headers: Record<string, string>;
  html: string;
  text: string;
  metadata: PageMetadata;
  loadTime: number;
  renderTime: number;
  size: number;
  screenshot?: string;
  pdf?: string;
  actionResults?: ActionResult[];
}

export interface ActionResult {
  action: string;
  success: boolean;
  error?: string;
  data?: unknown;
}

async function getBrowser(): Promise<Browser> {
  if (!browser) {
    logger.info('Launching browser');
    browser = await chromium.launch({
      headless: true,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-features=IsolateOrigins,site-per-process',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    });
  }
  return browser;
}

function mapWaitUntil(waitFor: WaitFor): 'load' | 'domcontentloaded' | 'networkidle' {
  return waitFor;
}

// Execute browser automation actions
async function executeActions(page: Page, actions: BrowserAction[]): Promise<ActionResult[]> {
  const results: ActionResult[] = [];

  for (const action of actions) {
    try {
      logger.debug({ action }, 'Executing browser action');

      switch (action.type) {
        case 'click': {
          await page.click(action.selector);
          if (action.waitAfter) {
            await page.waitForTimeout(action.waitAfter);
          }
          results.push({ action: `click: ${action.selector}`, success: true });
          break;
        }

        case 'scroll': {
          if (action.direction === 'bottom') {
            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
          } else if (action.direction === 'top') {
            await page.evaluate(() => window.scrollTo(0, 0));
          } else if (action.direction === 'down') {
            const amount = action.amount || 500;
            await page.evaluate((px) => window.scrollBy(0, px), amount);
          } else if (action.direction === 'up') {
            const amount = action.amount || 500;
            await page.evaluate((px) => window.scrollBy(0, -px), amount);
          }
          if (action.waitAfter) {
            await page.waitForTimeout(action.waitAfter);
          }
          results.push({ action: `scroll: ${action.direction}`, success: true });
          break;
        }

        case 'fill': {
          await page.fill(action.selector, action.value);
          if (action.waitAfter) {
            await page.waitForTimeout(action.waitAfter);
          }
          results.push({ action: `fill: ${action.selector}`, success: true });
          break;
        }

        case 'execute': {
          const scriptResult = await page.evaluate(action.script);
          if (action.waitAfter) {
            await page.waitForTimeout(action.waitAfter);
          }
          results.push({ action: 'execute script', success: true, data: scriptResult });
          break;
        }

        case 'wait': {
          if (action.selector) {
            await page.waitForSelector(action.selector, { timeout: action.timeout || 10000 });
          } else {
            await page.waitForTimeout(action.timeout || 1000);
          }
          results.push({ action: `wait: ${action.selector || action.timeout + 'ms'}`, success: true });
          break;
        }

        case 'screenshot': {
          // Screenshot action is handled separately, just mark as success
          results.push({ action: 'screenshot', success: true });
          break;
        }

        default:
          results.push({ action: 'unknown', success: false, error: 'Unknown action type' });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error({ error, action }, 'Action execution failed');
      results.push({ action: action.type, success: false, error: errorMessage });
    }
  }

  return results;
}

// Infinite scroll helper - keeps scrolling until no new content loads
export async function infiniteScroll(page: Page, maxScrolls: number = 10, waitTime: number = 1000): Promise<number> {
  let previousHeight = 0;
  let scrollCount = 0;

  while (scrollCount < maxScrolls) {
    const currentHeight = await page.evaluate(() => document.body.scrollHeight);

    if (currentHeight === previousHeight) {
      break; // No new content loaded
    }

    previousHeight = currentHeight;
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(waitTime);
    scrollCount++;
  }

  return scrollCount;
}

export async function browserScrape(
  url: string,
  config: Partial<JobConfig>
): Promise<BrowserScrapeResult> {
  const startTime = Date.now();
  let page: Page | null = null;

  logger.debug({ url }, 'Starting browser scrape');

  try {
    let browserInstance: Browser;
    try {
      browserInstance = await getBrowser();
    } catch (browserError) {
      logger.error({ error: browserError }, 'Failed to launch browser. Make sure Playwright browsers are installed: bunx playwright install chromium');
      throw new Error('Browser launch failed. Run: bunx playwright install chromium');
    }
    page = await browserInstance.newPage();

    // Set realistic user agent
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      ...config.headers,
    });

    // Set cookies if provided
    if (config.cookies?.length) {
      await page.context().addCookies(
        config.cookies.map((cookie) => ({
          name: cookie.name,
          value: cookie.value,
          domain: cookie.domain || new URL(url).hostname,
          path: '/',
        }))
      );
    }

    // Navigate to page
    let statusCode = 200;
    const headers: Record<string, string> = {};

    page.on('response', (response) => {
      if (response.url() === url || response.url() === page?.url()) {
        statusCode = response.status();
        for (const [key, value] of Object.entries(response.headers())) {
          headers[key] = value;
        }
      }
    });

    try {
      // Use 'domcontentloaded' as default - faster and more reliable than 'networkidle'
      const waitStrategy = config.waitFor || 'domcontentloaded';
      await page.goto(url, {
        waitUntil: mapWaitUntil(waitStrategy),
        timeout: config.timeout || 30000,
      });
    } catch (navError) {
      logger.error({ error: navError, url }, 'Page navigation failed');
      throw new Error(`Failed to load page: ${navError instanceof Error ? navError.message : 'Unknown error'}`);
    }

    // Wait for specific selector if provided
    if (config.waitForSelector) {
      await page.waitForSelector(config.waitForSelector, {
        timeout: config.timeout || 30000,
      });
    }

    // Execute browser actions if provided
    let actionResults: ActionResult[] | undefined;
    if (config.actions && config.actions.length > 0) {
      logger.info({ actionCount: config.actions.length }, 'Executing browser actions');
      actionResults = await executeActions(page, config.actions);
    }

    const loadTime = Date.now() - startTime;

    // Get final URL after any redirects
    const finalUrl = page.url();

    // Get HTML content
    const html = await page.content();

    // Use Cheerio to extract text and metadata
    const $ = cheerio.load(html);

    // Extract text content
    $('script, style, noscript, iframe').remove();
    const text = $('body').text().replace(/\s+/g, ' ').trim();

    // Extract metadata
    const metadata: PageMetadata = {
      title: $('title').text().trim() || '',
      description:
        $('meta[name="description"]').attr('content') ||
        $('meta[property="og:description"]').attr('content') ||
        '',
      language: $('html').attr('lang') || '',
      links: $('a[href]')
        .map((_, el) => $(el).attr('href'))
        .get()
        .filter((href): href is string => !!href && href.startsWith('http'))
        .slice(0, 100),
      images: $('img[src]')
        .map((_, el) => $(el).attr('src'))
        .get()
        .filter((src): src is string => !!src)
        .slice(0, 50),
    };

    const renderTime = Date.now() - startTime - loadTime;

    let screenshot: string | undefined;
    let pdf: string | undefined;

    // Take screenshot if requested
    if (config.screenshot) {
      const screenshotBuffer = await page.screenshot({
        type: 'png',
        fullPage: true,
      });
      screenshot = `data:image/png;base64,${screenshotBuffer.toString('base64')}`;
    }

    // Generate PDF if requested
    if (config.pdf) {
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
      });
      pdf = `data:application/pdf;base64,${pdfBuffer.toString('base64')}`;
    }

    logger.debug(
      { url, loadTime, renderTime, size: html.length, actionsExecuted: actionResults?.length || 0 },
      'Browser scrape completed'
    );

    return {
      url,
      finalUrl,
      statusCode,
      headers,
      html,
      text,
      metadata,
      loadTime,
      renderTime,
      size: html.length,
      screenshot,
      pdf,
      actionResults,
    };
  } finally {
    if (page) {
      await page.close();
    }
  }
}

export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
    logger.info('Browser closed');
  }
}
