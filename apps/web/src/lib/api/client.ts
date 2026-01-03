const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  auth?: boolean;
}

class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    // Load tokens from localStorage on init (client-side only)
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
      this.refreshToken = localStorage.getItem('refreshToken');
    }
  }

  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  getAccessToken() {
    return this.accessToken;
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const { method = 'GET', body, headers = {}, auth = true } = options;

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (auth && this.accessToken) {
      requestHeaders['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json() as ApiResponse<T>;

      if (!response.ok) {
        // Try to refresh token if unauthorized
        if (response.status === 401 && this.refreshToken && auth) {
          const refreshed = await this.tryRefreshToken();
          if (refreshed) {
            // Retry the request with new token
            return this.request<T>(endpoint, options);
          }
        }
        return data;
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error occurred',
        },
      };
    }
  }

  private async tryRefreshToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (!response.ok) {
        this.clearTokens();
        return false;
      }

      interface RefreshResponse {
        tokens: {
          accessToken: string;
          refreshToken: string;
        };
      }

      const data = await response.json() as ApiResponse<RefreshResponse>;
      if (data.success && data.data?.tokens) {
        this.setTokens(data.data.tokens.accessToken, data.data.tokens.refreshToken);
        return true;
      }

      this.clearTokens();
      return false;
    } catch {
      this.clearTokens();
      return false;
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request<{
      user: User;
      tokens: { accessToken: string; refreshToken: string };
    }>('/auth/login', {
      method: 'POST',
      body: { email, password },
      auth: false,
    });
  }

  async register(email: string, name: string, password: string) {
    return this.request<{
      user: User;
      tokens: { accessToken: string; refreshToken: string };
    }>('/auth/register', {
      method: 'POST',
      body: { email, name, password },
      auth: false,
    });
  }

  async googleAuth(credential: string) {
    return this.request<{
      user: User;
      tokens: { accessToken: string; refreshToken: string };
    }>('/auth/google', {
      method: 'POST',
      body: { credential },
      auth: false,
    });
  }

  async getGoogleConfig() {
    return this.request<{
      clientId: string | null;
      enabled: boolean;
    }>('/auth/google/config', {
      method: 'GET',
      auth: false,
    });
  }

  async logout() {
    if (!this.refreshToken) return;
    await this.request('/auth/logout', {
      method: 'POST',
      body: { refreshToken: this.refreshToken },
    });
    this.clearTokens();
  }

  async getMe() {
    return this.request<{ user: User }>('/auth/me');
  }

  // Scrape endpoints
  async scrape(params: ScrapeParams) {
    return this.request<ScrapeResult>('/v1/scrape', {
      method: 'POST',
      body: params,
    });
  }

  async getJob(jobId: string) {
    return this.request<{ job: ScrapeJob }>(`/v1/jobs/${jobId}`);
  }

  async listJobs(page = 1, limit = 20) {
    return this.request<{
      jobs: ScrapeJob[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/v1/jobs?page=${page}&limit=${limit}`);
  }

  // API Keys endpoints
  async listApiKeys() {
    return this.request<{ apiKeys: ApiKey[] }>('/api-keys');
  }

  async createApiKey(name: string, permissions: string[]) {
    return this.request<{ apiKey: ApiKey; rawKey: string }>('/api-keys', {
      method: 'POST',
      body: { name, permissions },
    });
  }

  async deleteApiKey(id: string) {
    return this.request(`/api-keys/${id}`, { method: 'DELETE' });
  }

  // Usage endpoints
  async getUsage(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    return this.request<{
      usage: UsageRecord[];
      summary: { totalCredits: number; totalRequests: number };
    }>(`/v1/usage?${params.toString()}`);
  }
}

// Scrape result type (synchronous)
export interface ScrapeResult {
  url: string;
  finalUrl: string;
  statusCode: number;
  html: string;
  text: string;
  data?: unknown;
  screenshot?: string;
  pdf?: string;
  metadata: {
    title: string;
    description: string;
    language?: string;
    links: string[];
    images: string[];
  };
  metrics: {
    loadTime: number;
    renderTime?: number;
    size: number;
    creditsUsed: number;
  };
}

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  credits: number;
  creditsResetAt: string;
  rateLimit: number;
}

export interface ScrapeParams {
  url: string;
  renderMode?: 'http' | 'browser';
  waitFor?: 'load' | 'domcontentloaded' | 'networkidle';
  waitForSelector?: string;
  timeout?: number;
  screenshot?: boolean;
  pdf?: boolean;
  extractSchema?: Record<string, unknown>;
  headers?: Record<string, string>;
}

export interface ScrapeJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  type: 'scrape' | 'search' | 'map' | 'crawl';
  config: ScrapeParams;
  result?: {
    url: string;
    finalUrl: string;
    statusCode: number;
    html?: string;
    text?: string;
    extractedData?: unknown;
    screenshot?: string;
    pdf?: string;
    loadTime: number;
    size: number;
  };
  error?: string;
  creditsUsed: number;
  createdAt: string;
  completedAt?: string;
}

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  permissions: string[];
  lastUsedAt?: string;
  createdAt: string;
}

export interface UsageRecord {
  date: string;
  creditsUsed: number;
  requestCount: number;
}

export const apiClient = new ApiClient();
