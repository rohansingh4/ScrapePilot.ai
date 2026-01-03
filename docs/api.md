# ScrapePilot API Documentation

ScrapePilot provides a powerful REST API for web scraping with AI-powered data extraction.

## Base URL

```
Production: https://api.scrapepilot.ai
Development: http://localhost:3001
```

## Authentication

ScrapePilot supports two authentication methods:

### 1. API Key (Recommended for production)

Include your API key in the Authorization header:

```bash
curl -H "Authorization: Bearer sp_live_xxxxx" \
  https://api.scrapepilot.ai/v1/scrape
```

### 2. JWT Token (For dashboard/sessions)

Include your JWT access token in the Authorization header:

```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  https://api.scrapepilot.ai/v1/scrape
```

---

## Scraping Endpoints

### Scrape URL

Scrape a single URL and return its content.

```http
POST /v1/scrape
```

#### Request Body

```json
{
  "url": "https://example.com",
  "renderMode": "http",
  "waitFor": "load",
  "waitForSelector": ".content",
  "timeout": 30000,
  "screenshot": false,
  "pdf": false,
  "extractSchema": {
    "title": "string",
    "price": "number"
  },
  "headers": {
    "User-Agent": "Custom User Agent"
  },
  "cookies": [
    {
      "name": "session",
      "value": "abc123",
      "domain": "example.com"
    }
  ]
}
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `url` | string | Yes | - | URL to scrape |
| `renderMode` | enum | No | `"http"` | `"http"` or `"browser"` |
| `waitFor` | enum | No | `"load"` | `"load"`, `"domcontentloaded"`, or `"networkidle"` |
| `waitForSelector` | string | No | - | CSS selector to wait for |
| `timeout` | number | No | 30000 | Timeout in milliseconds (1000-60000) |
| `screenshot` | boolean | No | false | Capture screenshot (browser mode only) |
| `pdf` | boolean | No | false | Generate PDF (browser mode only) |
| `extractSchema` | object | No | - | Schema for AI data extraction |
| `headers` | object | No | - | Custom HTTP headers |
| `cookies` | array | No | - | Cookies to send with request |

#### Response

```json
{
  "success": true,
  "data": {
    "url": "https://example.com",
    "finalUrl": "https://example.com/",
    "statusCode": 200,
    "html": "<!DOCTYPE html>...",
    "text": "Example Domain This domain is...",
    "data": {
      "title": "Example Domain",
      "price": null
    },
    "screenshot": "base64...",
    "pdf": "base64...",
    "metadata": {
      "title": "Example Domain",
      "description": "This domain is for use in documentation...",
      "language": "en",
      "links": ["https://iana.org/domains/example"],
      "images": []
    },
    "metrics": {
      "loadTime": 245,
      "renderTime": 1200,
      "size": 1270,
      "creditsUsed": 1
    }
  }
}
```

### Scrape with Screenshot

Convenience endpoint for screenshot capture.

```http
POST /v1/scrape/screenshot
```

Same request body as `/v1/scrape`, but automatically enables:
- `renderMode: "browser"`
- `screenshot: true`

### Scrape with AI Extraction

Convenience endpoint for AI-powered data extraction.

```http
POST /v1/scrape/extract
```

**Required:** `extractSchema` must be provided.

#### Example: Extract Product Data

```bash
curl -X POST https://api.scrapepilot.ai/v1/scrape/extract \
  -H "Authorization: Bearer sp_live_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://store.example.com/product/123",
    "extractSchema": {
      "name": "string - product name",
      "price": "number - price in USD",
      "currency": "string - currency code",
      "rating": "number - rating out of 5",
      "reviewCount": "number - total reviews",
      "availability": "boolean - in stock",
      "features": "array of strings - product features"
    }
  }'
```

Response:

```json
{
  "success": true,
  "data": {
    "url": "https://store.example.com/product/123",
    "finalUrl": "https://store.example.com/product/123",
    "data": {
      "name": "Premium Wireless Headphones",
      "price": 299.99,
      "currency": "USD",
      "rating": 4.7,
      "reviewCount": 2341,
      "availability": true,
      "features": [
        "Active Noise Cancellation",
        "40-hour battery life",
        "Bluetooth 5.2"
      ]
    },
    "metadata": {
      "title": "Premium Wireless Headphones | Store",
      "description": "...",
      "language": "en",
      "links": [],
      "images": []
    },
    "metrics": {
      "loadTime": 523,
      "size": 85420,
      "creditsUsed": 6
    }
  }
}
```

---

## Authentication Endpoints

### Register

Create a new user account.

```http
POST /auth/register
```

```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "securepassword123"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "name": "John Doe",
      "plan": "free",
      "credits": 1000,
      "creditsResetAt": "2024-02-15T00:00:00.000Z",
      "rateLimit": 10
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "a1b2c3d4e5f6...",
      "expiresIn": 900
    }
  }
}
```

### Login

Authenticate with email and password.

```http
POST /auth/login
```

```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

### Google OAuth

Authenticate with Google.

```http
POST /auth/google
```

```json
{
  "credential": "eyJhbGciOiJSUzI1NiIs..."
}
```

The `credential` is the ID token from Google Sign-In.

### Refresh Token

Get a new access token using refresh token.

```http
POST /auth/refresh
```

```json
{
  "refreshToken": "a1b2c3d4e5f6..."
}
```

### Logout

Invalidate refresh token.

```http
POST /auth/logout
Authorization: Bearer {accessToken}
```

```json
{
  "refreshToken": "a1b2c3d4e5f6..."
}
```

### Get Current User

```http
GET /auth/me
Authorization: Bearer {accessToken}
```

---

## API Key Management

### List API Keys

```http
GET /api-keys
Authorization: Bearer {accessToken}
```

Response:

```json
{
  "success": true,
  "data": {
    "apiKeys": [
      {
        "id": "507f1f77bcf86cd799439011",
        "name": "Production Key",
        "keyPrefix": "sp_live_abc1",
        "permissions": ["scrape", "search", "map", "crawl"],
        "usageCount": 1234,
        "lastUsedAt": "2024-01-15T12:30:00.000Z",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### Create API Key

```http
POST /api-keys
Authorization: Bearer {accessToken}
```

```json
{
  "name": "Production Key",
  "permissions": ["scrape", "search"]
}
```

Response includes the **full key** (only shown once):

```json
{
  "success": true,
  "data": {
    "apiKey": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Production Key",
      "keyPrefix": "sp_live_abc1",
      "permissions": ["scrape", "search"],
      "createdAt": "2024-01-15T12:30:00.000Z"
    },
    "rawKey": "sp_live_abc123def456..."
  }
}
```

### Delete API Key

```http
DELETE /api-keys/:id
Authorization: Bearer {accessToken}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request body |
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMITED` | 429 | Too many requests |
| `INSUFFICIENT_CREDITS` | 402 | Not enough credits |
| `INTERNAL_ERROR` | 500 | Server error |

### Rate Limit Headers

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1705320000
```

---

## Code Examples

### Node.js / TypeScript

```typescript
const response = await fetch('https://api.scrapepilot.ai/v1/scrape', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer sp_live_xxxxx',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    url: 'https://example.com',
    renderMode: 'http',
  }),
});

const data = await response.json();
console.log(data.data.text);
```

### Python

```python
import requests

response = requests.post(
    'https://api.scrapepilot.ai/v1/scrape',
    headers={
        'Authorization': 'Bearer sp_live_xxxxx',
        'Content-Type': 'application/json',
    },
    json={
        'url': 'https://example.com',
        'renderMode': 'http',
    }
)

data = response.json()
print(data['data']['text'])
```

### cURL

```bash
curl -X POST https://api.scrapepilot.ai/v1/scrape \
  -H "Authorization: Bearer sp_live_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","renderMode":"http"}'
```

---

## Rate Limits

| Plan | Requests/Minute | Concurrent |
|------|-----------------|------------|
| Free | 10 | 1 |
| Starter | 60 | 5 |
| Pro | 300 | 20 |
| Enterprise | Custom | Custom |

## Credit Costs

| Operation | Credits |
|-----------|---------|
| HTTP Scrape | 1 |
| Browser Scrape | 2 |
| Screenshot | +1 |
| PDF | +1 |
| AI Extraction | +5 |

Example: Browser scrape with screenshot and AI extraction = 2 + 1 + 5 = 8 credits
