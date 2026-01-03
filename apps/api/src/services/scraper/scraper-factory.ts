import { httpScrape, type ScrapeResult as HttpResult } from './http-scraper.js';
import { browserScrape, type BrowserScrapeResult } from './browser-scraper.js';
import type { JobConfig, RenderMode } from '@scrapepilot/shared';
import { logger } from '../../utils/logger.js';

export type ScrapeResult = HttpResult | BrowserScrapeResult;

export async function scrape(
  url: string,
  config: Partial<JobConfig>
): Promise<ScrapeResult> {
  const renderMode: RenderMode = config.renderMode || 'http';

  logger.info({ url, renderMode }, 'Starting scrape');

  // Use browser mode if:
  // - Explicitly requested
  // - Screenshot or PDF requested
  // - Wait for selector specified
  // - Wait for networkidle (requires JS execution)
  const needsBrowser =
    renderMode === 'browser' ||
    config.screenshot ||
    config.pdf ||
    config.waitForSelector ||
    config.waitFor === 'networkidle';

  if (needsBrowser) {
    return browserScrape(url, config);
  }

  return httpScrape(url, config);
}

export function calculateCredits(config: Partial<JobConfig>): number {
  let credits = 1; // Base HTTP scrape

  if (config.renderMode === 'browser') credits += 1;
  if (config.screenshot) credits += 1;
  if (config.pdf) credits += 2;
  if (config.extractSchema) credits += 2;

  return credits;
}
