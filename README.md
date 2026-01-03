# ScrapePilot.ai

Intelligent web scraping API that transforms any URL into structured data. Built with modern technologies for speed, reliability, and ease of use.

## Features

- **HTTP & Browser Scraping** - Choose between fast HTTP scraping or full browser rendering with Playwright
- **AI-Powered Extraction** - Extract structured data using GPT-4o-mini
- **Async Job Queue** - Handle long-running scrapes with BullMQ
- **Screenshot & PDF** - Capture full-page screenshots and generate PDFs
- **Rate Limiting** - Built-in rate limiting per user
- **API Key Management** - Secure API key authentication
- **Credit System** - Usage-based credit system with plans

## Tech Stack

### Frontend (`apps/web`)
- Next.js 16 + React 19
- TypeScript
- Tailwind CSS
- Three.js + Framer Motion
- Radix UI

### Backend (`apps/api`)
- Hono (TypeScript-first web framework)
- MongoDB + Mongoose
- Redis + BullMQ
- Playwright (browser automation)
- OpenAI API

### Infrastructure
- Bun (package manager & runtime)
- Turborepo (monorepo orchestration)
- Docker (databases)

## Project Structure

```
ScrapePilot.ai/
├── apps/
│   ├── web/                 # Next.js frontend
│   └── api/                 # Hono backend API
├── packages/
│   ├── shared/              # Shared types, validators, constants
│   ├── database/            # MongoDB models & Redis utilities
│   └── tsconfig/            # Shared TypeScript configs
├── docker/
│   └── docker-compose.yml   # MongoDB + Redis
├── docs/                    # Documentation
├── turbo.json               # Turborepo config
├── package.json             # Root workspace
└── .env.example             # Environment template
```

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) >= 1.1.0
- [Docker](https://www.docker.com) & Docker Compose
- Node.js >= 20 (for Playwright)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rohansingh4/ScrapePilot.ai.git
   cd ScrapePilot.ai
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Start databases**
   ```bash
   bun run db:start
   ```

4. **Copy environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Start development servers**
   ```bash
   bun run dev
   ```

   This starts:
   - Frontend at http://localhost:3000
   - API at http://localhost:3001

6. **Start the worker (in a separate terminal)**
   ```bash
   cd apps/api && bun run worker
   ```

## Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start all apps in development mode |
| `bun run build` | Build all apps for production |
| `bun run test` | Run all tests |
| `bun run lint` | Lint all apps |
| `bun run db:start` | Start MongoDB + Redis containers |
| `bun run db:stop` | Stop database containers |
| `bun run db:logs` | View database logs |

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and get tokens
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout
- `GET /auth/me` - Get current user

### API Keys
- `GET /api-keys` - List API keys
- `POST /api-keys` - Create API key
- `DELETE /api-keys/:id` - Revoke API key

### Scraping (Sync)
- `POST /v1/scrape` - Scrape a URL
- `POST /v1/scrape/screenshot` - Scrape with screenshot
- `POST /v1/scrape/extract` - Scrape with AI extraction

### Jobs (Async)
- `POST /v1/jobs` - Create async scrape job
- `GET /v1/jobs` - List jobs
- `GET /v1/jobs/:id` - Get job status
- `GET /v1/jobs/:id/result` - Get job result
- `DELETE /v1/jobs/:id` - Cancel job

### Usage
- `GET /v1/usage` - Get usage summary
- `GET /v1/usage/credits` - Get credit balance

## Environment Variables

See [.env.example](.env.example) for all available configuration options.

### Required
- `MONGODB_URI` - MongoDB connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - Secret for JWT signing

### Optional
- `OPENAI_API_KEY` - For AI extraction feature
- `STRIPE_*` - For payment integration
- `SENTRY_DSN` - For error tracking

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## License

MIT License - see [LICENSE](LICENSE) for details.
