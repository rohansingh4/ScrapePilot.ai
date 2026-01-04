import OpenAI from 'openai';
import * as cheerio from 'cheerio';
import { config } from '../../config/index.js';
import { logger } from '../../utils/logger.js';

type AIClient = OpenAI | null;

let aiClient: AIClient = null;

function getAIClient(): AIClient {
  if (aiClient) return aiClient;

  const provider = config.AI_PROVIDER;

  switch (provider) {
    case 'groq':
      if (!config.GROQ_API_KEY) {
        logger.warn('GROQ_API_KEY not configured');
        return null;
      }
      aiClient = new OpenAI({
        apiKey: config.GROQ_API_KEY,
        baseURL: 'https://api.groq.com/openai/v1',
      });
      logger.info('Using Groq AI provider');
      break;

    case 'ollama':
      aiClient = new OpenAI({
        apiKey: 'ollama',
        baseURL: `${config.OLLAMA_URL}/v1`,
      });
      logger.info(`Using Ollama AI provider at ${config.OLLAMA_URL}`);
      break;

    case 'openai':
    default:
      if (!config.OPENAI_API_KEY) {
        logger.warn('OPENAI_API_KEY not configured');
        return null;
      }
      aiClient = new OpenAI({
        apiKey: config.OPENAI_API_KEY,
      });
      logger.info('Using OpenAI provider');
      break;
  }

  return aiClient;
}

function getModelName(): string {
  switch (config.AI_PROVIDER) {
    case 'groq':
      return 'llama-3.3-70b-versatile';
    case 'ollama':
      return config.OLLAMA_MODEL;
    case 'openai':
    default:
      return 'gpt-4o-mini';
  }
}

// Clean HTML for AI processing
function cleanHtml(html: string): string {
  const $ = cheerio.load(html);
  $('script, style, noscript, iframe, svg, nav, footer, header').remove();

  // Remove hidden elements
  $('[style*="display: none"], [style*="display:none"], [hidden]').remove();

  // Get text with some structure preserved
  const text = $('body').text().replace(/\s+/g, ' ').trim();
  return text.slice(0, 15000); // Limit context size
}

// Convert HTML to clean markdown for LLM use
export function htmlToMarkdown(html: string): string {
  const $ = cheerio.load(html);

  // Remove unwanted elements
  $('script, style, noscript, iframe, svg, nav, footer').remove();

  let markdown = '';

  // Extract title
  const title = $('title').text().trim();
  if (title) {
    markdown += `# ${title}\n\n`;
  }

  // Extract meta description
  const description = $('meta[name="description"]').attr('content');
  if (description) {
    markdown += `> ${description}\n\n`;
  }

  // Process headings
  $('h1, h2, h3, h4, h5, h6').each((_, el) => {
    const level = parseInt(el.tagName[1]);
    const text = $(el).text().trim();
    if (text) {
      markdown += `${'#'.repeat(level)} ${text}\n\n`;
    }
  });

  // Process paragraphs
  $('p').each((_, el) => {
    const text = $(el).text().trim();
    if (text && text.length > 20) {
      markdown += `${text}\n\n`;
    }
  });

  // Process lists
  $('ul, ol').each((_, el) => {
    $(el).find('li').each((i, li) => {
      const text = $(li).text().trim();
      if (text) {
        markdown += `- ${text}\n`;
      }
    });
    markdown += '\n';
  });

  // Process tables
  $('table').each((_, table) => {
    const headers: string[] = [];
    $(table).find('th').each((_, th) => {
      headers.push($(th).text().trim());
    });

    if (headers.length > 0) {
      markdown += `| ${headers.join(' | ')} |\n`;
      markdown += `| ${headers.map(() => '---').join(' | ')} |\n`;
    }

    $(table).find('tr').each((_, tr) => {
      const cells: string[] = [];
      $(tr).find('td').each((_, td) => {
        cells.push($(td).text().trim());
      });
      if (cells.length > 0) {
        markdown += `| ${cells.join(' | ')} |\n`;
      }
    });
    markdown += '\n';
  });

  // Process links
  const links: string[] = [];
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    const text = $(el).text().trim();
    if (href && text && href.startsWith('http')) {
      links.push(`- [${text}](${href})`);
    }
  });

  if (links.length > 0) {
    markdown += `## Links\n\n${links.slice(0, 20).join('\n')}\n`;
  }

  return markdown.trim();
}

// Schema-based extraction (original functionality)
export async function extractData(
  html: string,
  schema: Record<string, unknown>
): Promise<Record<string, unknown> | undefined> {
  const client = getAIClient();

  if (!client) {
    logger.warn('No AI provider configured, skipping AI extraction');
    return undefined;
  }

  try {
    const cleanedText = cleanHtml(html);
    const schemaDescription = JSON.stringify(schema, null, 2);
    const model = getModelName();

    logger.debug({ provider: config.AI_PROVIDER, model }, 'Starting schema-based AI extraction');

    const response = await client.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: `You are a data extraction assistant. Extract structured data from the provided webpage content according to the given schema. Return only valid JSON matching the schema structure. If a field cannot be found, use null.`,
        },
        {
          role: 'user',
          content: `Extract data from this webpage content according to this schema:

Schema:
${schemaDescription}

Webpage Content:
${cleanedText}

Return only the extracted JSON data, no explanation.`,
        },
      ],
      temperature: 0,
      max_tokens: 4000,
      ...(config.AI_PROVIDER === 'openai' ? { response_format: { type: 'json_object' as const } } : {}),
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      logger.warn('No content returned from AI');
      return undefined;
    }

    let jsonContent = content.trim();
    if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
    }

    const extracted = JSON.parse(jsonContent);
    logger.debug({ schema: Object.keys(schema), provider: config.AI_PROVIDER }, 'Schema extraction completed');

    return extracted;
  } catch (error) {
    logger.error({ error, provider: config.AI_PROVIDER }, 'Schema extraction failed');
    return undefined;
  }
}

// NEW: Natural language extraction - the killer feature!
export async function extractWithPrompt(
  html: string,
  prompt: string
): Promise<{ data: unknown; format: 'array' | 'object' | 'text'; confidence: number } | undefined> {
  const client = getAIClient();

  if (!client) {
    logger.warn('No AI provider configured, skipping AI extraction');
    return undefined;
  }

  try {
    const cleanedText = cleanHtml(html);
    const model = getModelName();

    logger.info({ prompt, provider: config.AI_PROVIDER }, 'Starting natural language AI extraction');

    const response = await client.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: `You are an intelligent web scraping assistant. Your job is to extract data from webpage content based on natural language requests.

IMPORTANT RULES:
1. Always return valid JSON
2. If extracting multiple items, return an array
3. If extracting a single item or summary, return an object
4. Include a "confidence" field (0-1) indicating how confident you are in the extraction
5. Include a "format" field: "array" for lists, "object" for single items, "text" for summaries
6. Be precise and only extract what was asked for
7. If you can't find the requested data, return {"data": null, "format": "text", "confidence": 0, "message": "explanation"}

Example responses:
- For "get all product prices": {"data": [{"name": "Product A", "price": "$29.99"}, ...], "format": "array", "confidence": 0.95}
- For "what is the main topic": {"data": {"topic": "Technology", "summary": "..."}, "format": "object", "confidence": 0.8}`,
        },
        {
          role: 'user',
          content: `Extract the following from this webpage:

REQUEST: ${prompt}

WEBPAGE CONTENT:
${cleanedText}

Return your response as JSON with data, format, and confidence fields.`,
        },
      ],
      temperature: 0.1,
      max_tokens: 4000,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      logger.warn('No content returned from AI');
      return undefined;
    }

    let jsonContent = content.trim();
    if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
    }

    const result = JSON.parse(jsonContent);
    logger.info({
      prompt,
      format: result.format,
      confidence: result.confidence,
      itemCount: Array.isArray(result.data) ? result.data.length : 1
    }, 'Natural language extraction completed');

    return result;
  } catch (error) {
    logger.error({ error, prompt, provider: config.AI_PROVIDER }, 'Natural language extraction failed');
    return undefined;
  }
}

// NEW: Auto-detect extractable data from a page
export async function detectExtractableData(
  html: string
): Promise<{ suggestions: ExtractSuggestion[] } | undefined> {
  const client = getAIClient();

  if (!client) {
    return undefined;
  }

  try {
    const cleanedText = cleanHtml(html);
    const model = getModelName();

    logger.debug({ provider: config.AI_PROVIDER }, 'Auto-detecting extractable data');

    const response = await client.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: `You are a web scraping expert. Analyze webpage content and suggest what data could be extracted.

Return JSON with a "suggestions" array. Each suggestion should have:
- "name": short name for the data (e.g., "products", "articles", "prices")
- "description": what this data contains
- "type": "list" | "single" | "table"
- "fields": array of field names that could be extracted
- "confidence": 0-1 how likely this data exists
- "prompt": a natural language prompt to extract this data

Example:
{
  "suggestions": [
    {
      "name": "products",
      "description": "Product listings with prices",
      "type": "list",
      "fields": ["name", "price", "description", "image"],
      "confidence": 0.9,
      "prompt": "Extract all products with their names, prices, and descriptions"
    }
  ]
}`,
        },
        {
          role: 'user',
          content: `Analyze this webpage and suggest what data can be extracted:

${cleanedText}

Return JSON with suggestions array.`,
        },
      ],
      temperature: 0.2,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      return undefined;
    }

    let jsonContent = content.trim();
    if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
    }

    const result = JSON.parse(jsonContent);
    logger.debug({ suggestionCount: result.suggestions?.length }, 'Auto-detection completed');

    return result;
  } catch (error) {
    logger.error({ error }, 'Auto-detection failed');
    return undefined;
  }
}

export interface ExtractSuggestion {
  name: string;
  description: string;
  type: 'list' | 'single' | 'table';
  fields: string[];
  confidence: number;
  prompt: string;
}

// Helper to check if AI is configured
export function isAIConfigured(): boolean {
  switch (config.AI_PROVIDER) {
    case 'groq':
      return !!config.GROQ_API_KEY;
    case 'ollama':
      return true;
    case 'openai':
    default:
      return !!config.OPENAI_API_KEY;
  }
}

// Get current AI provider info
export function getAIProviderInfo(): { provider: string; configured: boolean; model: string } {
  return {
    provider: config.AI_PROVIDER,
    configured: isAIConfigured(),
    model: getModelName(),
  };
}

// Convert extracted data to CSV format
export function toCSV(data: unknown): string {
  if (!Array.isArray(data) || data.length === 0) {
    return '';
  }

  const items = data as Record<string, unknown>[];
  const headers = Object.keys(items[0]);

  const csvRows = [
    headers.join(','),
    ...items.map(item =>
      headers.map(header => {
        const value = item[header];
        const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value ?? '');
        // Escape quotes and wrap in quotes if contains comma
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ];

  return csvRows.join('\n');
}

// Convert extracted data to formatted JSON
export function toJSON(data: unknown, pretty: boolean = true): string {
  return pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
}
