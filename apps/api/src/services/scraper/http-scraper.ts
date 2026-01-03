import { request } from 'undici';
import * as cheerio from 'cheerio';
import type { JobConfig, PageMetadata } from '@scrapepilot/shared';
import { logger } from '../../utils/logger.js';

export interface ScrapeResult {
  url: string;
  finalUrl: string;
  statusCode: number;
  headers: Record<string, string>;
  html: string;
  text: string;
  metadata: PageMetadata;
  loadTime: number;
  size: number;
}

export async function httpScrape(
  url: string,
  config: Partial<JobConfig>
): Promise<ScrapeResult> {
  const startTime = Date.now();

  logger.debug({ url }, 'Starting HTTP scrape');

  const headers: Record<string, string> = {
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    Accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    Connection: 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    ...config.headers,
  };

  const response = await request(url, {
    method: 'GET',
    headers,
    bodyTimeout: config.timeout || 30000,
    headersTimeout: config.timeout || 30000,
  });

  const html = await response.body.text();
  const loadTime = Date.now() - startTime;

  // Parse HTML with Cheerio
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

  // Convert response headers
  const responseHeaders: Record<string, string> = {};
  for (const [key, value] of Object.entries(response.headers)) {
    if (typeof value === 'string') {
      responseHeaders[key] = value;
    } else if (Array.isArray(value)) {
      responseHeaders[key] = value.join(', ');
    }
  }

  logger.debug({ url, loadTime, size: html.length }, 'HTTP scrape completed');

  return {
    url,
    finalUrl: url, // undici doesn't expose final URL after redirects easily
    statusCode: response.statusCode,
    headers: responseHeaders,
    html,
    text,
    metadata,
    loadTime,
    size: html.length,
  };
}
