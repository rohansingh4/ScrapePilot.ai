import { chromium, Browser, Page } from 'playwright';
import * as cheerio from 'cheerio';
import type { JobConfig, PageMetadata, WaitFor } from '@scrapepilot/shared';
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

export async function browserScrape(
  url: string,
  config: Partial<JobConfig>
): Promise<BrowserScrapeResult> {
  const startTime = Date.now();
  let page: Page | null = null;

  logger.debug({ url }, 'Starting browser scrape');

  try {
    const browserInstance = await getBrowser();
    page = await browserInstance.newPage();

    // Set user agent
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
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

    await page.goto(url, {
      waitUntil: mapWaitUntil(config.waitFor || 'load'),
      timeout: config.timeout || 30000,
    });

    // Wait for specific selector if provided
    if (config.waitForSelector) {
      await page.waitForSelector(config.waitForSelector, {
        timeout: config.timeout || 30000,
      });
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
      { url, loadTime, renderTime, size: html.length },
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
