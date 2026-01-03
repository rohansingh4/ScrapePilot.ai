// ===========================================
// Plan Constants
// ===========================================

export const PLANS = {
  free: {
    name: 'Free',
    credits: 1000,
    rateLimit: 10, // requests per minute
    features: ['Basic scraping', 'HTTP mode only', 'Community support'],
  },
  starter: {
    name: 'Starter',
    credits: 10000,
    rateLimit: 30,
    features: ['All scraping modes', 'Browser rendering', 'Email support'],
  },
  pro: {
    name: 'Pro',
    credits: 100000,
    rateLimit: 100,
    features: ['All scraping modes', 'Priority support', 'Webhooks', 'AI extraction'],
  },
  enterprise: {
    name: 'Enterprise',
    credits: -1, // unlimited
    rateLimit: 500,
    features: ['Unlimited credits', 'Dedicated support', 'Custom SLA', 'On-premise option'],
  },
} as const;

// ===========================================
// Credit Costs
// ===========================================

export const CREDIT_COSTS = {
  base: 1, // Base HTTP scrape
  browser: 1, // Additional for browser rendering
  screenshot: 1, // Additional for screenshot
  pdf: 2, // Additional for PDF
  extraction: 2, // Additional for AI extraction
} as const;

// ===========================================
// Job Constants
// ===========================================

export const JOB_DEFAULTS = {
  timeout: 30000,
  renderMode: 'http' as const,
  waitFor: 'load' as const,
};

export const JOB_LIMITS = {
  maxTimeout: 60000,
  minTimeout: 1000,
  maxRetries: 3,
  retryDelay: 1000, // ms
};

// ===========================================
// API Key Constants
// ===========================================

export const API_KEY_PREFIX = 'sp_live_';

export const DEFAULT_PERMISSIONS = ['scrape', 'search', 'map', 'crawl'] as const;

// ===========================================
// Rate Limiting
// ===========================================

export const RATE_LIMIT = {
  windowMs: 60 * 1000, // 1 minute
  defaultLimit: 10,
} as const;

// ===========================================
// Timeouts
// ===========================================

export const TIMEOUTS = {
  scrape: 30000,
  browser: 60000,
  queue: 300000, // 5 minutes
} as const;

// ===========================================
// HTTP Constants
// ===========================================

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// ===========================================
// Error Codes
// ===========================================

export const ERROR_CODES = {
  // Auth errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  UNAUTHORIZED: 'UNAUTHORIZED',

  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',

  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',

  // Rate limiting
  RATE_LIMITED: 'RATE_LIMITED',
  INSUFFICIENT_CREDITS: 'INSUFFICIENT_CREDITS',

  // Scraping errors
  SCRAPE_FAILED: 'SCRAPE_FAILED',
  TIMEOUT: 'TIMEOUT',
  BLOCKED: 'BLOCKED',

  // Server errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;
