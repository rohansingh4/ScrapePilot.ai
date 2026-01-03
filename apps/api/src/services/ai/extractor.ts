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
      // Ollama has OpenAI-compatible API
      aiClient = new OpenAI({
        apiKey: 'ollama', // Ollama doesn't need a real key
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
      return 'llama-3.3-70b-versatile'; // Fast & free on Groq
    case 'ollama':
      return config.OLLAMA_MODEL;
    case 'openai':
    default:
      return 'gpt-4o-mini';
  }
}

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
    // Clean HTML for extraction
    const $ = cheerio.load(html);
    $('script, style, noscript, iframe, svg').remove();

    // Get text content with structure hints
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    const truncatedText = bodyText.slice(0, 15000); // Limit context size

    const schemaDescription = JSON.stringify(schema, null, 2);
    const model = getModelName();

    logger.debug({ provider: config.AI_PROVIDER, model }, 'Starting AI extraction');

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
${truncatedText}

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

    // Parse JSON - handle potential markdown code blocks
    let jsonContent = content.trim();
    if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
    }

    const extracted = JSON.parse(jsonContent);
    logger.debug({ schema: Object.keys(schema), provider: config.AI_PROVIDER }, 'AI extraction completed');

    return extracted;
  } catch (error) {
    logger.error({ error, provider: config.AI_PROVIDER }, 'AI extraction failed');
    return undefined;
  }
}

// Helper to check if AI is configured
export function isAIConfigured(): boolean {
  switch (config.AI_PROVIDER) {
    case 'groq':
      return !!config.GROQ_API_KEY;
    case 'ollama':
      return true; // Ollama is local, always "configured"
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
