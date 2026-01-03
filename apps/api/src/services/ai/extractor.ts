import OpenAI from 'openai';
import * as cheerio from 'cheerio';
import { config } from '../../config/index.js';
import { logger } from '../../utils/logger.js';

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI | null {
  if (!config.OPENAI_API_KEY) {
    return null;
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: config.OPENAI_API_KEY,
    });
  }

  return openaiClient;
}

export async function extractData(
  html: string,
  schema: Record<string, unknown>
): Promise<Record<string, unknown> | undefined> {
  const client = getOpenAIClient();

  if (!client) {
    logger.warn('OpenAI API key not configured, skipping AI extraction');
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

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
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
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      logger.warn('No content returned from OpenAI');
      return undefined;
    }

    const extracted = JSON.parse(content);
    logger.debug({ schema: Object.keys(schema) }, 'AI extraction completed');

    return extracted;
  } catch (error) {
    logger.error({ error }, 'AI extraction failed');
    return undefined;
  }
}
