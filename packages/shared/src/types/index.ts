// ===========================================
// Core Type Definitions
// ===========================================

// Plan Types
export type Plan = 'free' | 'starter' | 'pro' | 'enterprise';

// Permission Types
export type Permission = 'scrape' | 'search' | 'map' | 'crawl';

// Job Types
export type JobType = 'scrape' | 'search' | 'map' | 'crawl';
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

// Scrape Configuration Types
export type RenderMode = 'http' | 'browser';
export type WaitFor = 'load' | 'domcontentloaded' | 'networkidle';

// ===========================================
// User Types
// ===========================================

export interface User {
  id: string;
  email: string;
  name: string;
  plan: Plan;
  credits: number;
  creditsResetAt: Date;
  rateLimit: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPublic {
  id: string;
  email: string;
  name: string;
  plan: Plan;
  credits: number;
  creditsResetAt: Date;
  rateLimit: number;
}

// ===========================================
// API Key Types
// ===========================================

export interface ApiKey {
  id: string;
  userId: string;
  name: string;
  keyPrefix: string;
  permissions: Permission[];
  isActive: boolean;
  lastUsedAt: Date | null;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiKeyPublic {
  id: string;
  name: string;
  keyPrefix: string;
  permissions: Permission[];
  isActive: boolean;
  lastUsedAt: Date | null;
  usageCount: number;
  createdAt: Date;
}

// ===========================================
// Job Configuration Types
// ===========================================

export interface Cookie {
  name: string;
  value: string;
  domain?: string;
}

export interface JobConfig {
  renderMode: RenderMode;
  waitFor: WaitFor;
  waitForSelector?: string;
  timeout: number;
  screenshot: boolean;
  pdf: boolean;
  extractSchema?: Record<string, unknown>;
  headers?: Record<string, string>;
  cookies?: Cookie[];
}

export interface JobMetrics {
  queuedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
  creditsUsed: number;
  retries: number;
}

export interface JobError {
  code: string;
  message: string;
}

// ===========================================
// Scrape Job Types
// ===========================================

export interface ScrapeJob {
  id: string;
  userId: string;
  apiKeyId: string;
  type: JobType;
  url: string;
  config: JobConfig;
  status: JobStatus;
  progress: number;
  resultId?: string;
  metrics: JobMetrics;
  error?: JobError;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScrapeJobPublic {
  id: string;
  type: JobType;
  url: string;
  status: JobStatus;
  progress: number;
  metrics: JobMetrics;
  error?: JobError;
  createdAt: Date;
}

// ===========================================
// Scrape Result Types
// ===========================================

export interface PageMetadata {
  title: string;
  description?: string;
  language?: string;
  links: string[];
  images: string[];
}

export interface Performance {
  loadTime: number;
  renderTime?: number;
  size: number;
}

export interface ScrapeResult {
  id: string;
  jobId: string;
  userId: string;
  url: string;
  finalUrl: string;
  statusCode: number;
  headers: Record<string, string>;
  html: string;
  text: string;
  markdown?: string;
  data?: Record<string, unknown>;
  screenshot?: string;
  pdf?: string;
  metadata: PageMetadata;
  performance: Performance;
  createdAt: Date;
}

export interface ScrapeResultPublic {
  url: string;
  finalUrl: string;
  statusCode: number;
  html: string;
  text: string;
  markdown?: string;
  data?: Record<string, unknown>;
  screenshot?: string;
  pdf?: string;
  metadata: PageMetadata;
  performance: Performance;
}

// ===========================================
// Usage Types
// ===========================================

export interface UsageByType {
  scrape: number;
  search: number;
  map: number;
  crawl: number;
}

export interface UsageByRenderMode {
  http: number;
  browser: number;
}

export interface UsageRecord {
  id: string;
  userId: string;
  apiKeyId: string;
  date: string; // YYYY-MM-DD
  hour: number; // 0-23
  timestamp: Date;
  requests: number;
  successful: number;
  failed: number;
  creditsUsed: number;
  byType: UsageByType;
  byRenderMode: UsageByRenderMode;
  createdAt: Date;
}

export interface UsageSummary {
  totalRequests: number;
  successful: number;
  failed: number;
  creditsUsed: number;
  byType: UsageByType;
  byRenderMode: UsageByRenderMode;
}

// ===========================================
// API Response Types
// ===========================================

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ===========================================
// Auth Types
// ===========================================

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginResponse {
  user: UserPublic;
  tokens: AuthTokens;
}

export interface RegisterResponse {
  user: UserPublic;
  tokens: AuthTokens;
}
