# ScrapePilot.ai - Comprehensive Project Plan

## Product Vision
**ScrapePilot.ai** - An intelligent web scraping API platform that transforms any URL into structured data. Built for developers who need reliability, speed, and AI-powered extraction at scale.

---

## 1. Tech Stack

### Frontend (Primary Focus)
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.x | React framework with App Router, SSR, SSG |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Utility-first styling |
| Framer Motion | 11.x | UI animations |
| Three.js + React Three Fiber | Latest | 3D animated backgrounds |
| Radix UI | Latest | Accessible primitive components |
| Zustand | 5.x | Client state management |
| TanStack Query | 5.x | Server state & caching |
| React Hook Form + Zod | Latest | Form handling & validation |

### Backend (Phase 2)
| Technology | Purpose |
|------------|---------|
| Node.js / Bun | Runtime |
| Hono | Fast API framework |
| PostgreSQL | Primary database |
| Drizzle ORM | Type-safe database queries |
| Redis | Caching, rate limiting, queues |
| BullMQ | Job queue for scraping tasks |

### Authentication & Payments
| Service | Purpose |
|---------|---------|
| Better Auth / Clerk | User authentication |
| Stripe | Payments & subscriptions |

### Testing
| Tool | Purpose |
|------|---------|
| Vitest | Unit & integration tests |
| Playwright | E2E testing |
| Testing Library | Component testing |
| MSW | API mocking |

### Deployment
| Service | Purpose |
|---------|---------|
| Vercel | Frontend hosting |
| Railway / Fly.io | Backend services |
| Cloudflare | CDN, DNS, DDoS protection |
| AWS S3 / Cloudflare R2 | File storage |

---

## 2. Project Structure

```
scrapepilot.ai/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (marketing)/        # Public pages group
│   │   │   ├── page.tsx        # Landing page
│   │   │   ├── pricing/
│   │   │   ├── docs/
│   │   │   ├── changelog/
│   │   │   └── playground/
│   │   ├── (auth)/             # Auth pages group
│   │   │   ├── sign-in/
│   │   │   ├── sign-up/
│   │   │   └── forgot-password/
│   │   ├── (dashboard)/        # Protected dashboard
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx        # Dashboard home
│   │   │   ├── api-keys/
│   │   │   ├── usage/
│   │   │   ├── billing/
│   │   │   └── settings/
│   │   ├── api/                # API routes
│   │   ├── layout.tsx          # Root layout
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                 # Base UI components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── code-block.tsx
│   │   │   └── ...
│   │   ├── layout/             # Layout components
│   │   │   ├── navbar.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── mobile-nav.tsx
│   │   ├── landing/            # Landing page sections
│   │   │   ├── hero.tsx
│   │   │   ├── api-playground.tsx
│   │   │   ├── features.tsx
│   │   │   ├── cortex-section.tsx
│   │   │   ├── code-examples.tsx
│   │   │   ├── comparison-table.tsx
│   │   │   ├── use-cases.tsx
│   │   │   ├── stats.tsx
│   │   │   └── cta.tsx
│   │   ├── 3d/                 # Three.js components
│   │   │   ├── floating-spheres.tsx
│   │   │   ├── crystal-animation.tsx
│   │   │   └── scene-provider.tsx
│   │   └── dashboard/          # Dashboard components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities & configs
│   │   ├── utils.ts
│   │   ├── cn.ts               # Class name utility
│   │   └── constants.ts
│   ├── stores/                 # Zustand stores
│   └── types/                  # TypeScript types
├── tests/
│   ├── unit/                   # Vitest unit tests
│   ├── integration/            # Integration tests
│   └── e2e/                    # Playwright E2E tests
├── public/
│   ├── images/
│   └── fonts/
├── .env.example
├── .env.local
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── vitest.config.ts
├── playwright.config.ts
└── next.config.ts
```

---

## 3. Design System

### Color Palette (AMOLED Dark Theme)
```css
:root {
  /* Base Colors */
  --background: 0 0% 0%;           /* Pure black #000000 */
  --foreground: 0 0% 98%;          /* Almost white */

  /* Card & Surface */
  --card: 0 0% 4%;                 /* #0a0a0a */
  --card-hover: 0 0% 8%;           /* #141414 */
  --card-border: 0 0% 14%;         /* #242424 */

  /* Primary (Brand) */
  --primary: 262 83% 58%;          /* Purple #8B5CF6 */
  --primary-hover: 262 83% 65%;

  /* Accent */
  --accent-pink: 330 85% 60%;      /* Pink for crystal */
  --accent-blue: 217 91% 60%;      /* Blue accent */
  --accent-green: 142 76% 36%;     /* Success green */

  /* Muted */
  --muted: 0 0% 40%;
  --muted-foreground: 0 0% 64%;

  /* Status */
  --success: 142 76% 36%;
  --warning: 38 92% 50%;
  --error: 0 84% 60%;
}
```

### Typography
```css
/* Font Family */
--font-sans: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', monospace;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */
--text-6xl: 3.75rem;   /* 60px */
--text-7xl: 4.5rem;    /* 72px */
```

### Animation Tokens
```css
/* Durations */
--duration-fast: 150ms;
--duration-normal: 300ms;
--duration-slow: 500ms;

/* Easings */
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

---

## 4. Page Sections & Components

### Landing Page Sections (In Order)

#### 4.1 Navigation Bar
- Logo (ScrapePilot.ai)
- Nav links: Pricing, Playground, Docs, Changelog
- Sign in / Get started buttons
- Mobile hamburger menu

#### 4.2 Hero Section
- Badge: "Trusted by developers worldwide"
- Main headline: "Transform the Web into Data" (gradient text)
- Subheadline: "Structured data scraping API..."
- CTA buttons: "Start building free" + "Documentation"
- Trust badges: 99.9% uptime, Extract anything, No credit card, SOC 2 aligned
- **Background: Floating 3D spheres animation**

#### 4.3 Interactive API Playground
- Mac-style window frame
- Tabs: Scrape, Search, Map, Crawl
- URL input field
- "Scrape" action button
- Live response preview

#### 4.4 Stats Bar
- <2s Avg Response Time
- LLM Ready - Structured Output
- Up to 1,000 Free Scrapes

#### 4.5 Developer Experience Section
- Badge: "</> Developer Experience"
- Headline: "Simple API, Powerful Results"
- Feature pills: Lightning Fast, Enterprise Grade, Smart Rendering
- Code example tabs: cURL, Python, Node.js
- Response preview panel

#### 4.6 AI Cortex Section
- Badge: "Powered by AI"
- Headline: "ScrapePilot Cortex"
- Description: AI monitoring system
- **Animated crystal/flower 3D graphic**
- Feature cards with timeline:
  - Autonomous Failure Recovery
  - Adaptive Anti-Bot Strategies
  - Cross-Domain Intelligence
  - Predictive Optimization

#### 4.7 Zero-Touch Optimization
- 4-step process cards:
  1. Detect
  2. Diagnose
  3. Optimize
  4. Deploy

#### 4.8 Production Features Section
- Headline: "Production-grade features that scale"
- Feature cards with dashboard screenshots:
  - Fast response times (<2s, 99.9%, 50+ PoPs)
  - Full browser automation
  - Clear usage tracking

#### 4.9 Feature Tags Section
- "Plus 20+ more features"
- Tag pills: Proxy Rotation, CAPTCHA Solving, Rate Limiting, Auto Retries, Webhooks, Analytics, Scheduling, Custom Headers, Cookie Management, PDF Extraction, OCR, Data Pipelines

#### 4.10 Comparison Table
- Feature comparison: Traditional vs ScrapePilot
- Rows: Setup Time, Infrastructure, JS Rendering, Proxy Rotation, CAPTCHA

#### 4.11 Use Cases Section
- E-Commerce: Price Intelligence
- SEO: Search Analytics
- Finance: Market Data
- Media: Content Aggregation
- Sales: Lead Generation

#### 4.12 Final CTA Section
- "Ready to get started?"
- Buttons: Get started free, View pricing
- Benefits: No credit card, $1 free credit, Pay per use, $5 minimum

#### 4.13 Footer
- Logo + tagline
- Product links
- Company links
- Legal links
- Social icons

---

## 5. 3D Animation Strategy

### Floating Spheres (Hero Background)
```typescript
// Three.js implementation plan
- 5-8 spheres of varying sizes (0.5 - 2.0 units)
- Metallic dark material with subtle reflection
- Slow floating animation (sin/cos based)
- Depth-of-field blur effect
- Positioned around edges, not blocking content
- Performance: Use instanced meshes, LOD
```

### Crystal Animation (Cortex Section)
```typescript
// Animated crystal/flower graphic
- Procedural geometry or imported GLTF
- Gradient shader: pink to purple
- Subtle rotation animation
- Particle effects around it
- Glow/bloom post-processing
```

### Performance Considerations
- Use `React.lazy` for 3D components
- Fallback static gradient for low-end devices
- Respect `prefers-reduced-motion`
- Target 60fps on mid-range devices

---

## 6. API Structure (Backend Reference)

### Public Endpoints
```
POST /api/v1/scrape          # Basic scraping
POST /api/v1/scrape/js       # JavaScript rendering
POST /api/v1/search          # Search across sites
POST /api/v1/map             # Site mapping
POST /api/v1/crawl           # Multi-page crawling
GET  /api/v1/status/:jobId   # Job status
```

### Auth Endpoints
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

### Dashboard Endpoints
```
GET  /api/dashboard/stats
GET  /api/dashboard/usage
GET  /api/keys              # List API keys
POST /api/keys              # Create API key
DELETE /api/keys/:id        # Revoke API key
GET  /api/billing/invoices
POST /api/billing/checkout  # Stripe checkout
```

---

## 7. Environment Variables

```bash
# .env.example

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/scrapepilot

# Redis
REDIS_URL=redis://localhost:6379

# Auth
AUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# External Services
RESEND_API_KEY=             # Email
SENTRY_DSN=                 # Error tracking

# Feature Flags
NEXT_PUBLIC_ENABLE_3D=true
```

---

## 8. Pricing Model

### Plans
| Plan | Price | Credits | Features |
|------|-------|---------|----------|
| Free | $0 | 1,000/month | Basic scraping, Community support |
| Starter | $29/mo | 25,000/mo | + JS rendering, Email support |
| Pro | $99/mo | 100,000/mo | + Priority queue, Webhooks, API |
| Enterprise | Custom | Unlimited | + SLA, Dedicated support, Custom |

### Credit Costs
| Operation | Credits |
|-----------|---------|
| Basic scrape | 1 |
| JS rendering | 2 |
| Screenshot | 1 |
| PDF | 2 |
| OCR | 3 |
| CAPTCHA solve | 5 |

---

## 9. Testing Strategy

### Test Coverage Goals
- Unit tests: 80%+ coverage
- Integration tests: Critical paths
- E2E tests: All user flows

### Test Cases per Feature

#### Navigation
| Test ID | Description | Type |
|---------|-------------|------|
| NAV-001 | Logo links to homepage | E2E |
| NAV-002 | All nav links work | E2E |
| NAV-003 | Mobile menu opens/closes | E2E |
| NAV-004 | Sign in redirects to auth | E2E |

#### Hero Section
| Test ID | Description | Type |
|---------|-------------|------|
| HERO-001 | CTA button navigates to signup | E2E |
| HERO-002 | 3D animation renders without errors | Integration |
| HERO-003 | Fallback shows when WebGL unavailable | Unit |

#### API Playground
| Test ID | Description | Type |
|---------|-------------|------|
| PLAY-001 | Tab switching works | Unit |
| PLAY-002 | URL input validates format | Unit |
| PLAY-003 | Scrape button triggers demo | Integration |
| PLAY-004 | Response displays correctly | Unit |

#### Authentication
| Test ID | Description | Type |
|---------|-------------|------|
| AUTH-001 | Sign up with email works | E2E |
| AUTH-002 | Sign in with email works | E2E |
| AUTH-003 | OAuth (Google/GitHub) works | E2E |
| AUTH-004 | Invalid credentials show error | E2E |
| AUTH-005 | Password reset flow works | E2E |
| AUTH-006 | Session persists on refresh | E2E |

#### Dashboard
| Test ID | Description | Type |
|---------|-------------|------|
| DASH-001 | Stats load correctly | Integration |
| DASH-002 | API key generation works | E2E |
| DASH-003 | API key copy to clipboard | E2E |
| DASH-004 | Usage graph renders | Unit |

#### Billing
| Test ID | Description | Type |
|---------|-------------|------|
| BILL-001 | Plan selection works | E2E |
| BILL-002 | Stripe checkout opens | E2E |
| BILL-003 | Invoice list displays | Integration |

---

## 10. Implementation Phases

### Phase 1: Frontend Foundation (Current Focus)
1. Project setup (Next.js 15, TypeScript, Tailwind)
2. Design system & UI components
3. 3D background animations
4. Complete landing page
5. Static pricing page
6. Component tests

### Phase 2: Authentication & Dashboard UI
1. Auth pages (sign in, sign up, forgot password)
2. Dashboard layout
3. API keys management UI
4. Usage analytics UI
5. Settings pages

### Phase 3: Backend API
1. Database schema
2. Auth system
3. API endpoints
4. Rate limiting
5. Job queue

### Phase 4: Payments & Launch
1. Stripe integration
2. Subscription management
3. Usage metering
4. E2E tests
5. Production deployment

---

## 11. Deployment Pipeline

```yaml
# GitHub Actions workflow
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    - Run linting (ESLint)
    - Run type checking (tsc)
    - Run unit tests (Vitest)
    - Run E2E tests (Playwright)

  preview:
    - Deploy to Vercel preview
    - Comment preview URL on PR

  production:
    - Deploy to Vercel production (main branch only)
    - Run smoke tests
    - Notify Slack/Discord
```

---

## 12. Security Checklist

- [ ] HTTPS everywhere
- [ ] API key hashing (bcrypt)
- [ ] Rate limiting per API key
- [ ] CORS configuration
- [ ] CSP headers
- [ ] Input validation (Zod)
- [ ] SQL injection prevention (ORM)
- [ ] XSS prevention (React escaping)
- [ ] CSRF protection
- [ ] Secure cookie settings
- [ ] Environment variable protection
- [ ] Dependency vulnerability scanning

---

## Next Steps

Ready to proceed with **Phase 1: Frontend Foundation**:
1. Initialize Next.js 15 project
2. Configure Tailwind CSS v4
3. Set up design tokens
4. Create base UI components
5. Build 3D animated background
6. Implement landing page sections
7. Set up testing infrastructure

Shall I proceed with implementation?
