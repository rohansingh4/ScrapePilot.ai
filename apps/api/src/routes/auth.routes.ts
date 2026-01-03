import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { registerSchema, loginSchema, refreshTokenSchema } from '@scrapepilot/shared';
import { authMiddleware } from '../middleware/auth.middleware.js';
import * as authService from '../services/auth.service.js';

const auth = new Hono();

// POST /auth/register
auth.post('/register', zValidator('json', registerSchema), async (c) => {
  const body = c.req.valid('json');
  const { user, tokens } = await authService.register(body);

  return c.json(
    {
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          plan: user.plan,
          credits: user.credits,
          creditsResetAt: user.creditsResetAt,
          rateLimit: user.rateLimit,
        },
        tokens,
      },
    },
    201
  );
});

// POST /auth/login
auth.post('/login', zValidator('json', loginSchema), async (c) => {
  const body = c.req.valid('json');
  const { user, tokens } = await authService.login(body);

  return c.json({
    success: true,
    data: {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        credits: user.credits,
        creditsResetAt: user.creditsResetAt,
        rateLimit: user.rateLimit,
      },
      tokens,
    },
  });
});

// POST /auth/refresh
auth.post('/refresh', zValidator('json', refreshTokenSchema), async (c) => {
  const { refreshToken } = c.req.valid('json');

  // Extract userId from the current token if available, or from request
  const authHeader = c.req.header('Authorization');
  let userId: string | undefined;

  if (authHeader?.startsWith('Bearer ')) {
    try {
      // Try to decode the token (even if expired) to get userId
      const token = authHeader.substring(7);
      const decoded = JSON.parse(
        Buffer.from(token.split('.')[1]!, 'base64').toString()
      ) as { userId: string };
      userId = decoded.userId;
    } catch {
      // If token is invalid, we need userId from another source
    }
  }

  if (!userId) {
    return c.json(
      {
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'Unable to identify user. Please login again.',
        },
      },
      400
    );
  }

  const tokens = await authService.refreshAccessToken(userId, refreshToken);

  return c.json({
    success: true,
    data: { tokens },
  });
});

// POST /auth/logout (requires auth)
auth.post('/logout', authMiddleware, zValidator('json', refreshTokenSchema), async (c) => {
  const user = c.get('user');
  const { refreshToken } = c.req.valid('json');

  await authService.logout(user._id.toString(), refreshToken);

  return c.json({
    success: true,
    data: { message: 'Logged out successfully' },
  });
});

// GET /auth/me (requires auth)
auth.get('/me', authMiddleware, async (c) => {
  const user = c.get('user');

  return c.json({
    success: true,
    data: {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        credits: user.credits,
        creditsResetAt: user.creditsResetAt,
        rateLimit: user.rateLimit,
      },
    },
  });
});

export default auth;
