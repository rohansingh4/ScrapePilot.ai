export const SITE_CONFIG = {
  name: "ScrapePilot",
  description:
    "Intelligent web scraping API that transforms any URL into structured data. Built for developers who need reliability, speed, and AI-powered extraction at scale.",
  url: "https://scrapepilot.ai",
  ogImage: "/og.png",
  links: {
    twitter: "https://twitter.com/rohans411",
    github: "https://github.com/rohansingh4",
    linkedin: "https://www.linkedin.com/in/rohansingh411/",
    discord: "https://discord.gg/scrapepilot",
  },
};

export const NAV_LINKS = [
  { label: "Pricing", href: "/pricing" },
  { label: "Playground", href: "/playground" },
  { label: "Docs", href: "/docs" },
  { label: "Changelog", href: "/changelog" },
];

export const STATS = [
  { value: "<2s", label: "Avg Response Time" },
  { value: "LLM Ready", label: "Structured Output" },
  { value: "1,000", label: "Free Scrapes" },
];

export const TRUST_BADGES = [
  { icon: "dot", label: "99.9% uptime", color: "green" },
  { icon: "check", label: "Extract anything" },
  { icon: "check", label: "No credit card" },
  { icon: "check", label: "SOC 2 aligned" },
];

export const FEATURES = [
  {
    icon: "Zap",
    title: "Lightning Fast",
    description: "Under 2s response",
  },
  {
    icon: "Shield",
    title: "Enterprise Grade",
    description: "99.9% uptime SLA",
  },
  {
    icon: "Sparkles",
    title: "Smart Rendering",
    description: "Full JS execution",
  },
];

export const CODE_EXAMPLES = {
  curl: `curl -X POST https://api.scrapepilot.ai/v1/scrape \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://example.com",
    "waitFor": "networkidle",
    "screenshot": true
  }'`,
  python: `import requests

response = requests.post(
    "https://api.scrapepilot.ai/v1/scrape",
    headers={
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json"
    },
    json={
        "url": "https://example.com",
        "waitFor": "networkidle",
        "screenshot": True
    }
)

data = response.json()
print(data)`,
  nodejs: `const response = await fetch(
  'https://api.scrapepilot.ai/v1/scrape',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: 'https://example.com',
      waitFor: 'networkidle',
      screenshot: true
    }),
  }
);

const data = await response.json();
console.log(data);`,
};

export const SAMPLE_RESPONSE = `{
  "success": true,
  "data": {
    "html": "<!DOCTYPE html>...",
    "screenshot": "data:image/png;base64,...",
    "metrics": {
      "responseTime": "1.2s",
      "loadTime": "850ms"
    }
  }
}`;

export const CORTEX_FEATURES = [
  {
    title: "Autonomous Failure Recovery",
    description:
      "When a scrape fails, Cortex analyzes the root cause, generates multiple fix strategies, validates them in parallel, and deploys the optimal solution—all without human intervention.",
  },
  {
    title: "Adaptive Anti-Bot Strategies",
    description:
      "Cortex continuously learns from successful and failed attempts, dynamically adjusting browser fingerprints, request patterns, and timing to stay ahead of detection systems.",
  },
  {
    title: "Cross-Domain Intelligence",
    description:
      "Insights learned from one domain automatically improve performance on similar sites. The system builds a knowledge graph of web structures, defense mechanisms, and optimal extraction patterns.",
  },
  {
    title: "Predictive Optimization",
    description:
      "Machine learning models predict which sites are likely to change or implement new protections, proactively testing and adapting before failures occur.",
  },
];

export const OPTIMIZATION_STEPS = [
  {
    number: "01",
    title: "Detect",
    description: "Monitor all scraping requests and identify patterns in failures",
  },
  {
    number: "02",
    title: "Diagnose",
    description: "AI analyzes root causes using ML models and historical data",
  },
  {
    number: "03",
    title: "Optimize",
    description: "Generate and test multiple solution candidates in parallel",
  },
  {
    number: "04",
    title: "Deploy",
    description: "Automatically roll out the best-performing strategy",
  },
];

export const FEATURE_TAGS = [
  "Proxy Rotation",
  "CAPTCHA Solving",
  "Rate Limiting",
  "Auto Retries",
  "Webhooks",
  "Analytics",
  "Scheduling",
  "Custom Headers",
  "Cookie Management",
  "PDF Extraction",
  "OCR Technology",
  "Data Pipelines",
];

export const COMPARISON_DATA = [
  {
    feature: "Setup Time",
    traditional: "2-3 weeks",
    scrapepilot: "5 minutes",
    highlight: true,
  },
  {
    feature: "Infrastructure Management",
    traditional: "Self-hosted servers, proxies, browsers",
    scrapepilot: "Fully managed",
    highlight: false,
  },
  {
    feature: "JavaScript Rendering",
    traditional: "Complex Puppeteer/Selenium setup",
    scrapepilot: "Built-in Playwright",
    highlight: true,
  },
  {
    feature: "Proxy Rotation",
    traditional: "Manual proxy pool management",
    scrapepilot: "Automatic rotation",
    highlight: false,
  },
  {
    feature: "CAPTCHA Handling",
    traditional: "Custom integration required",
    scrapepilot: "Automatic solving",
    highlight: true,
  },
];

export const USE_CASES = [
  {
    category: "E-COMMERCE",
    title: "Price Intelligence",
    description:
      "Stay ahead of the competition by monitoring real-time pricing across thousands of retailers. Track product availability, aggregate customer reviews, and make data-driven pricing decisions.",
    stats: ["1M+ products tracked", "500+ retailers monitored", "<5min update frequency"],
    color: "orange",
  },
  {
    category: "SEO",
    title: "Search Analytics",
    description:
      "Dominate search rankings with comprehensive SERP monitoring. Track keyword positions, analyze competitor strategies, and monitor search features across Google, Bing, and other engines.",
    stats: ["10K+ keywords tracked", "50+ countries supported", "Daily ranking updates"],
    color: "green",
  },
  {
    category: "FINANCE",
    title: "Market Data",
    description:
      "Power your trading algorithms with reliable, real-time financial data. Extract stock prices, market indicators, and economic data from global exchanges.",
    stats: ["100+ exchanges covered", "Real-time data feeds", "99.9% uptime"],
    color: "orange",
  },
  {
    category: "MEDIA",
    title: "Content Aggregation",
    description:
      "Build comprehensive news and content platforms by aggregating articles from thousands of publishers. Automatically collect, categorize, and deduplicate content.",
    stats: ["50K+ articles/day", "1000+ news sources", "Multi-language support"],
    color: "pink",
  },
  {
    category: "SALES",
    title: "Lead Generation",
    description:
      "Supercharge your sales pipeline with high-quality B2B leads extracted from the web. Automatically gather business information, contact details, and company data at scale.",
    stats: ["25K+ leads/month", "98% data accuracy", "CRM integrations"],
    color: "green",
  },
];

export const PRICING_PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for testing and small projects",
    credits: "1,000",
    features: [
      "1,000 free credits/month",
      "Basic scraping",
      "Community support",
      "Rate limit: 10 req/min",
    ],
    cta: "Get started free",
    highlighted: false,
  },
  {
    name: "Starter",
    price: "$29",
    period: "/month",
    description: "For growing applications",
    credits: "25,000",
    features: [
      "25,000 credits/month",
      "JavaScript rendering",
      "Email support",
      "Rate limit: 60 req/min",
      "Webhooks",
    ],
    cta: "Start free trial",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$99",
    period: "/month",
    description: "For production workloads",
    credits: "100,000",
    features: [
      "100,000 credits/month",
      "Priority queue",
      "Priority support",
      "Rate limit: 200 req/min",
      "API access",
      "Custom headers",
    ],
    cta: "Start free trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large-scale operations",
    credits: "Unlimited",
    features: [
      "Unlimited credits",
      "Dedicated infrastructure",
      "SLA guarantee",
      "24/7 support",
      "Custom integrations",
      "Dedicated account manager",
    ],
    cta: "Contact sales",
    highlighted: false,
  },
];

export const FOOTER_LINKS = {
  product: [
    { label: "Pricing", href: "/pricing" },
    { label: "Documentation", href: "/docs" },
    { label: "Changelog", href: "/changelog" },
    { label: "Status", href: "/status" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ],
  legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "Licenses", href: "/licenses" },
  ],
};
