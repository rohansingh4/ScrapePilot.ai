import { z } from 'zod';

// ===========================================
// Auth Validators
// ===========================================

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const googleAuthSchema = z.object({
  credential: z.string().min(1, 'Google credential is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;

// ===========================================
// Scrape Validators
// ===========================================

export const cookieSchema = z.object({
  name: z.string(),
  value: z.string(),
  domain: z.string().optional(),
});

// Browser action schemas for automation
export const clickActionSchema = z.object({
  type: z.literal('click'),
  selector: z.string(),
  waitAfter: z.number().optional(), // ms to wait after click
});

export const scrollActionSchema = z.object({
  type: z.literal('scroll'),
  direction: z.enum(['top', 'bottom', 'up', 'down']).default('bottom'),
  amount: z.number().optional(), // pixels, if not specified scrolls to end
  waitAfter: z.number().optional(),
});

export const fillActionSchema = z.object({
  type: z.literal('fill'),
  selector: z.string(),
  value: z.string(),
  waitAfter: z.number().optional(),
});

export const executeActionSchema = z.object({
  type: z.literal('execute'),
  script: z.string(), // JavaScript to execute
  waitAfter: z.number().optional(),
});

export const waitActionSchema = z.object({
  type: z.literal('wait'),
  selector: z.string().optional(),
  timeout: z.number().optional(),
});

export const screenshotActionSchema = z.object({
  type: z.literal('screenshot'),
  selector: z.string().optional(), // screenshot specific element
  fullPage: z.boolean().default(true),
});

export const browserActionSchema = z.discriminatedUnion('type', [
  clickActionSchema,
  scrollActionSchema,
  fillActionSchema,
  executeActionSchema,
  waitActionSchema,
  screenshotActionSchema,
]);

export const scrapeRequestSchema = z.object({
  url: z.string().url('Invalid URL format'),
  renderMode: z.enum(['http', 'browser']).default('http'),
  waitFor: z.enum(['load', 'domcontentloaded', 'networkidle']).default('load'),
  waitForSelector: z.string().optional(),
  timeout: z.number().min(1000).max(60000).default(30000),
  screenshot: z.boolean().default(false),
  pdf: z.boolean().default(false),
  // Schema-based extraction (structured)
  extractSchema: z.record(z.unknown()).optional(),
  // NEW: AI natural language extraction prompt
  extractPrompt: z.string().optional(), // e.g. "Get all product names and prices"
  // NEW: Browser automation actions
  actions: z.array(browserActionSchema).optional(),
  // NEW: Export format preference
  exportFormat: z.enum(['json', 'csv', 'markdown']).optional(),
  headers: z.record(z.string()).optional(),
  cookies: z.array(cookieSchema).optional(),
});

export type ScrapeInput = z.infer<typeof scrapeRequestSchema>;
export type BrowserAction = z.infer<typeof browserActionSchema>;

// ===========================================
// Job Validators
// ===========================================

export const jobIdSchema = z.object({
  id: z.string().min(1, 'Job ID is required'),
});

export const jobListQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
  type: z.enum(['scrape', 'search', 'map', 'crawl']).optional(),
});

export type JobIdInput = z.infer<typeof jobIdSchema>;
export type JobListQuery = z.infer<typeof jobListQuerySchema>;

// ===========================================
// API Key Validators
// ===========================================

export const createApiKeySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be at most 50 characters'),
  permissions: z
    .array(z.enum(['scrape', 'search', 'map', 'crawl']))
    .min(1, 'At least one permission is required')
    .default(['scrape', 'search', 'map', 'crawl']),
});

export const apiKeyIdSchema = z.object({
  id: z.string().min(1, 'API Key ID is required'),
});

export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
export type ApiKeyIdInput = z.infer<typeof apiKeyIdSchema>;

// ===========================================
// Usage Validators
// ===========================================

export const usageQuerySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
  apiKeyId: z.string().optional(),
});

export type UsageQuery = z.infer<typeof usageQuerySchema>;

// ===========================================
// Common Validators
// ===========================================

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
