import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { HTTPException } from 'hono/http-exception';
import { createApiKeySchema, apiKeyIdSchema } from '@scrapepilot/shared';
import { ApiKey } from '@scrapepilot/database';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { generateApiKey } from '../utils/crypto.js';

const apiKeys = new Hono();

// All routes require JWT authentication
apiKeys.use('*', authMiddleware);

// GET /api-keys - List all API keys
apiKeys.get('/', async (c) => {
  const user = c.get('user');

  const keys = await ApiKey.find({ userId: user._id, isActive: true })
    .select('name keyPrefix permissions lastUsedAt usageCount createdAt')
    .sort({ createdAt: -1 });

  return c.json({
    success: true,
    data: {
      apiKeys: keys.map((key) => ({
        id: key._id,
        name: key.name,
        keyPrefix: key.keyPrefix,
        permissions: key.permissions,
        lastUsedAt: key.lastUsedAt,
        usageCount: key.usageCount,
        createdAt: key.createdAt,
      })),
    },
  });
});

// POST /api-keys - Create a new API key
apiKeys.post('/', zValidator('json', createApiKeySchema), async (c) => {
  const user = c.get('user');
  const { name, permissions } = c.req.valid('json');

  const { key, prefix, hash } = generateApiKey();

  const apiKey = await ApiKey.create({
    userId: user._id,
    name: name || 'Default Key',
    keyHash: hash,
    keyPrefix: prefix,
    permissions: permissions || ['scrape', 'search', 'map', 'crawl'],
  });

  return c.json(
    {
      success: true,
      data: {
        apiKey: {
          id: apiKey._id,
          name: apiKey.name,
          key, // Only returned once!
          keyPrefix: apiKey.keyPrefix,
          permissions: apiKey.permissions,
          createdAt: apiKey.createdAt,
        },
      },
      message: 'Save this API key securely. It will not be shown again.',
    },
    201
  );
});

// DELETE /api-keys/:id - Revoke an API key
apiKeys.delete('/:id', zValidator('param', apiKeyIdSchema), async (c) => {
  const user = c.get('user');
  const { id } = c.req.valid('param');

  const apiKey = await ApiKey.findOneAndUpdate(
    { _id: id, userId: user._id },
    { isActive: false },
    { new: true }
  );

  if (!apiKey) {
    throw new HTTPException(404, { message: 'API key not found' });
  }

  return c.json({
    success: true,
    message: 'API key revoked successfully',
  });
});

export default apiKeys;
