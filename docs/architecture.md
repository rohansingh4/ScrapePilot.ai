# ScrapePilot Architecture

This document describes the technical architecture of ScrapePilot, an intelligent web scraping API platform.

## System Overview

ScrapePilot is built as a modern monorepo using Turborepo with Bun as the package manager. It consists of a Next.js frontend and a Hono backend API, sharing common packages for types and database models.

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web Dashboard<br/>Next.js 16]
        SDK[SDK/CLI<br/>API Clients]
    end

    subgraph "API Gateway"
        API[Hono API Server<br/>Port 3001]
        AUTH[Auth Middleware<br/>JWT + API Keys]
        RATE[Rate Limiter<br/>Redis-based]
    end

    subgraph "Core Services"
        HTTP[HTTP Scraper<br/>Undici]
        BROWSER[Browser Scraper<br/>Playwright]
        AI[AI Extractor<br/>OpenAI GPT-4o-mini]
    end

    subgraph "Job Processing"
        QUEUE[Job Queue<br/>BullMQ]
        WORKER[Workers<br/>Bun Runtime]
    end

    subgraph "Data Layer"
        MONGO[(MongoDB<br/>Documents)]
        REDIS[(Redis<br/>Cache/Queue)]
    end

    WEB --> API
    SDK --> API
    API --> AUTH
    AUTH --> RATE
    RATE --> HTTP
    RATE --> BROWSER
    HTTP --> AI
    BROWSER --> AI
    API --> QUEUE
    QUEUE --> WORKER
    WORKER --> HTTP
    WORKER --> BROWSER
    API --> MONGO
    RATE --> REDIS
    QUEUE --> REDIS
```

## Directory Structure

```
ScrapePilot.ai/
├── apps/
│   ├── web/                    # Next.js 16 frontend
│   │   ├── src/
│   │   │   ├── app/            # App router pages
│   │   │   ├── components/     # React components
│   │   │   ├── contexts/       # React contexts (auth)
│   │   │   └── lib/            # Utilities & API client
│   │   └── package.json
│   │
│   └── api/                    # Hono backend API
│       ├── src/
│       │   ├── routes/         # API route handlers
│       │   ├── middleware/     # Auth, rate limiting
│       │   ├── services/       # Business logic
│       │   │   ├── scraper/    # HTTP & browser scrapers
│       │   │   ├── queue/      # BullMQ job processing
│       │   │   └── ai/         # OpenAI integration
│       │   ├── workers/        # Background job workers
│       │   └── config/         # Environment config
│       └── package.json
│
├── packages/
│   ├── shared/                 # Shared types & validators
│   │   └── src/
│   │       ├── types/          # TypeScript interfaces
│   │       ├── validators/     # Zod schemas
│   │       └── constants/      # Plan configs, etc.
│   │
│   ├── database/               # MongoDB models & Redis
│   │   └── src/
│   │       ├── models/         # Mongoose models
│   │       ├── connection.ts   # MongoDB connection
│   │       └── redis.ts        # Redis client
│   │
│   └── tsconfig/               # Shared TypeScript configs
│
├── docker/
│   └── docker-compose.yml      # MongoDB + Redis containers
│
└── docs/                       # Documentation
```

## Request Flow

### Authentication Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant A as API Gateway
    participant M as MongoDB
    participant R as Redis

    Note over C,R: Registration Flow
    C->>A: POST /auth/register
    A->>A: Validate input (Zod)
    A->>A: Hash password (bcrypt)
    A->>M: Create user document
    A->>A: Generate JWT + Refresh token
    A->>R: Store refresh token
    A->>C: Return tokens + user data

    Note over C,R: Login Flow
    C->>A: POST /auth/login
    A->>M: Find user by email
    A->>A: Verify password
    A->>A: Generate new tokens
    A->>R: Store refresh token
    A->>C: Return tokens + user data

    Note over C,R: Google OAuth Flow
    C->>A: POST /auth/google {credential}
    A->>A: Decode Google JWT
    A->>M: Find or create user
    A->>A: Generate tokens
    A->>R: Store refresh token
    A->>C: Return tokens + user data
```

### Scraping Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant A as API
    participant HTTP as HTTP Scraper
    participant BR as Browser Scraper
    participant AI as AI Extractor
    participant M as MongoDB

    C->>A: POST /v1/scrape {url, options}
    A->>A: Authenticate (JWT/API Key)
    A->>A: Check rate limit
    A->>A: Verify credits

    alt HTTP Mode
        A->>HTTP: Fetch URL
        HTTP->>HTTP: Parse HTML (Cheerio)
        HTTP->>A: Return content
    else Browser Mode
        A->>BR: Launch Playwright
        BR->>BR: Navigate & wait
        BR->>BR: Extract content
        BR->>A: Return content + screenshot
    end

    opt AI Extraction
        A->>AI: Extract with schema
        AI->>AI: GPT-4o-mini processing
        AI->>A: Return structured data
    end

    A->>M: Deduct credits
    A->>C: Return scraped data
```

## Data Models

### User Model

```mermaid
erDiagram
    USER {
        ObjectId _id PK
        string email UK
        string name
        string passwordHash
        enum authProvider
        string googleId
        string avatarUrl
        enum plan
        number credits
        date creditsResetAt
        number rateLimit
        boolean isActive
        date createdAt
        date updatedAt
    }

    APIKEY {
        ObjectId _id PK
        ObjectId userId FK
        string name
        string keyHash UK
        string keyPrefix
        array permissions
        number usageCount
        date lastUsedAt
        boolean isActive
        date createdAt
    }

    USER ||--o{ APIKEY : owns
```

### Job & Result Models

```mermaid
erDiagram
    SCRAPEJOB {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId apiKeyId FK
        enum type
        enum status
        object config
        string error
        number creditsUsed
        number priority
        number attempts
        date createdAt
        date startedAt
        date completedAt
    }

    SCRAPERESULT {
        ObjectId _id PK
        ObjectId jobId FK
        string url
        string finalUrl
        number statusCode
        object headers
        string html
        string text
        object extractedData
        string screenshot
        string pdf
        object metadata
        number loadTime
        number renderTime
        number size
        date createdAt
    }

    SCRAPEJOB ||--|| SCRAPERESULT : produces
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login with email/password |
| POST | `/auth/google` | Login with Google OAuth |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Logout (invalidate refresh token) |
| GET | `/auth/me` | Get current user |

### Scraping

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/scrape` | Scrape a URL (sync) |
| POST | `/v1/scrape/screenshot` | Scrape with screenshot |
| POST | `/v1/scrape/extract` | Scrape with AI extraction |

### API Keys

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api-keys` | List user's API keys |
| POST | `/api-keys` | Create new API key |
| DELETE | `/api-keys/:id` | Revoke API key |

## Scraper Implementation

### HTTP Scraper

The HTTP scraper uses Undici for fast HTTP requests and Cheerio for HTML parsing.

```mermaid
flowchart TD
    A[Receive URL] --> B{Custom Headers?}
    B -->|Yes| C[Apply headers]
    B -->|No| D[Use defaults]
    C --> E[Make HTTP request]
    D --> E
    E --> F{Success?}
    F -->|Yes| G[Parse HTML with Cheerio]
    F -->|No| H[Throw error]
    G --> I[Extract metadata]
    I --> J[Extract text content]
    J --> K[Return result]
```

**Features:**
- Custom headers support
- Cookie handling
- Automatic redirect following
- HTML to text extraction
- Metadata extraction (title, description, links, images)

### Browser Scraper

The browser scraper uses Playwright for JavaScript rendering.

```mermaid
flowchart TD
    A[Receive URL] --> B[Get browser instance]
    B --> C[Create new page]
    C --> D[Apply cookies/headers]
    D --> E[Navigate to URL]
    E --> F{Wait condition}
    F -->|load| G[Wait for load event]
    F -->|networkidle| H[Wait for network idle]
    F -->|selector| I[Wait for element]
    G --> J{Screenshot?}
    H --> J
    I --> J
    J -->|Yes| K[Capture screenshot]
    J -->|No| L[Extract content]
    K --> L
    L --> M[Close page]
    M --> N[Return result]
```

**Features:**
- Full JavaScript execution
- Screenshot capture (PNG/JPEG)
- PDF generation
- Custom viewport settings
- Wait conditions (load, networkidle, selector)
- Cookie and header injection

## Credit System

```mermaid
pie title Credit Usage by Operation
    "HTTP Scrape" : 1
    "Browser Scrape" : 2
    "With Screenshot" : 3
    "With AI Extraction" : 5
```

| Plan | Monthly Credits | Rate Limit |
|------|-----------------|------------|
| Free | 1,000 | 10 req/min |
| Starter | 10,000 | 60 req/min |
| Pro | 100,000 | 300 req/min |
| Enterprise | Unlimited | Custom |

## Security

### Authentication

- **JWT Tokens**: Short-lived access tokens (15 min)
- **Refresh Tokens**: Long-lived, stored in Redis (7 days)
- **API Keys**: Hashed with SHA-256, prefix `sp_live_`
- **Google OAuth**: JWT verification without secrets needed

### Rate Limiting

```mermaid
flowchart TD
    A[Request] --> B{Check Redis}
    B --> C[Get request count]
    C --> D{Under limit?}
    D -->|Yes| E[Increment counter]
    E --> F[Process request]
    D -->|No| G[Return 429]
    F --> H[Response]
```

- Per-user rate limiting based on plan
- Redis-based sliding window
- Graceful degradation on Redis failure

### Input Validation

All inputs validated with Zod schemas:
- Email format validation
- URL validation
- Timeout limits (1-60 seconds)
- Schema structure validation

## Deployment

### Development

```bash
# Start databases
bun run db:start

# Start all services
bun run dev
```

### Production

```bash
# Build all packages
bun run build

# Start API
cd apps/api && bun run start

# Start worker (separate process)
cd apps/api && bun run worker:start

# Start web
cd apps/web && bun run start
```

### Docker

```yaml
# docker-compose.yml includes:
- MongoDB 7 (port 27017)
- Redis 7 Alpine (port 6379)
```

## Environment Variables

See `.env.example` for all configuration options:

- `MONGODB_URI` - MongoDB connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - Secret for JWT signing
- `OPENAI_API_KEY` - OpenAI API key (optional)
- `GOOGLE_CLIENT_ID` - Google OAuth client ID (optional)
