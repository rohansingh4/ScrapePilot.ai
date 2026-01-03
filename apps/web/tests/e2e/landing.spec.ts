import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the hero section', async ({ page }) => {
    // Check for main headline
    await expect(page.getByText('Transform the Web')).toBeVisible();
    await expect(page.getByText('into Data')).toBeVisible();

    // Check for CTA buttons
    await expect(page.getByRole('link', { name: /start building free/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /documentation/i })).toBeVisible();
  });

  test('should have working navigation', async ({ page }) => {
    // Check navbar exists
    const navbar = page.locator('header');
    await expect(navbar).toBeVisible();

    // Check logo links to home
    const logo = page.getByRole('link').filter({ has: page.locator('svg') }).first();
    await expect(logo).toHaveAttribute('href', '/');

    // Check nav links
    await expect(page.getByRole('link', { name: /pricing/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /docs/i }).first()).toBeVisible();
  });

  test('should display API playground section', async ({ page }) => {
    // Scroll to API playground
    await page.evaluate(() => window.scrollBy(0, 600));

    // Check for playground elements
    await expect(page.getByPlaceholder(/example.com/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /scrape/i }).first()).toBeVisible();
  });

  test('should display stats section', async ({ page }) => {
    // Check for stats
    await expect(page.getByText('<2s')).toBeVisible();
    await expect(page.getByText('LLM Ready')).toBeVisible();
    await expect(page.getByText('1,000')).toBeVisible();
  });

  test('should display footer with links', async ({ page }) => {
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Check footer sections
    await expect(page.getByRole('heading', { name: /product/i, level: 3 })).toBeVisible();
    await expect(page.getByRole('heading', { name: /company/i, level: 3 })).toBeVisible();
    await expect(page.getByRole('heading', { name: /legal/i, level: 3 })).toBeVisible();
  });

  test('CTA buttons should navigate correctly', async ({ page }) => {
    // Click on "Start building free"
    const ctaButton = page.getByRole('link', { name: /start building free/i }).first();
    await expect(ctaButton).toHaveAttribute('href', '/sign-up');
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Hero should still be visible
    await expect(page.getByText('Transform the Web')).toBeVisible();

    // Mobile menu button should be visible
    const menuButton = page.locator('button[aria-label="Toggle menu"]');
    await expect(menuButton).toBeVisible();
  });
});

test.describe('Pricing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pricing');
  });

  test('should display pricing plans', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /simple, predictable pricing/i })).toBeVisible();

    // Check for plan names
    await expect(page.getByText('Free').first()).toBeVisible();
    await expect(page.getByText('Starter').first()).toBeVisible();
    await expect(page.getByText('Pro').first()).toBeVisible();
    await expect(page.getByText('Enterprise').first()).toBeVisible();
  });

  test('should display credit usage table', async ({ page }) => {
    await expect(page.getByText('Credit Usage')).toBeVisible();
    await expect(page.getByText('Basic HTML scrape')).toBeVisible();
  });

  test('should display FAQ section', async ({ page }) => {
    await expect(page.getByText('Frequently Asked Questions')).toBeVisible();
    await expect(page.getByText('How do credits work?')).toBeVisible();
  });
});
