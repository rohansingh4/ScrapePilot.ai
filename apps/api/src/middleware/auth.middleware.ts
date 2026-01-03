import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import jwt from 'jsonwebtoken';
import { User, ApiKey, type IUser, type IApiKey } from '@scrapepilot/database';
import { config } from '../config/index.js';
import { hashApiKey } from '../utils/crypto.js';

// Extend Hono context with our custom variables
declare module 'hono' {
  interface ContextVariableMap {
    user: IUser;
    apiKey?: IApiKey;
  }
}

interface JwtPayload {
  userId: string;
  email: string;
}

/**
 * Middleware to authenticate users via JWT token
 */
export const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    throw new HTTPException(401, { message: 'Missing authorization token' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      throw new HTTPException(401, { message: 'User not found or inactive' });
    }

    c.set('user', user);
    await next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new HTTPException(401, { message: 'Invalid token' });
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new HTTPException(401, { message: 'Token expired' });
    }
    throw error;
  }
});

/**
 * Middleware to authenticate via API key or JWT token
 * Used for API endpoints that support both authentication methods
 */
export const apiKeyMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    throw new HTTPException(401, { message: 'Missing API key or token' });
  }

  const key = authHeader.substring(7);

  try {
    if (key.startsWith('sp_live_')) {
      // API key authentication
      const keyHash = hashApiKey(key);
      const apiKey = await ApiKey.findOne({ keyHash, isActive: true });

      if (!apiKey) {
        throw new HTTPException(401, { message: 'Invalid API key' });
      }

      const user = await User.findById(apiKey.userId);

      if (!user || !user.isActive) {
        throw new HTTPException(401, { message: 'User not found or inactive' });
      }

      // Update last used timestamp
      await ApiKey.updateOne(
        { _id: apiKey._id },
        { $set: { lastUsedAt: new Date() }, $inc: { usageCount: 1 } }
      );

      c.set('user', user);
      c.set('apiKey', apiKey);
      await next();
    } else {
      // Try JWT authentication
      const decoded = jwt.verify(key, config.JWT_SECRET) as JwtPayload;
      const user = await User.findById(decoded.userId);

      if (!user || !user.isActive) {
        throw new HTTPException(401, { message: 'User not found or inactive' });
      }

      c.set('user', user);
      await next();
    }
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      throw new HTTPException(401, { message: 'Invalid authentication' });
    }
    throw error;
  }
});
