import jwt from 'jsonwebtoken';
import { HTTPException } from 'hono/http-exception';
import { config } from '../config/index.js';
import { getRedisClient, User, type IUser } from '@scrapepilot/database';
import { hashPassword, comparePassword, generateRefreshToken } from '../utils/crypto.js';
import type { RegisterInput, LoginInput, AuthTokens } from '@scrapepilot/shared';

interface JwtPayload {
  userId: string;
  email: string;
}

function generateAccessToken(user: IUser): string {
  const payload: JwtPayload = {
    userId: user._id.toString(),
    email: user.email,
  };

  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

async function saveRefreshToken(userId: string, refreshToken: string): Promise<void> {
  const redis = getRedisClient();
  const key = `refresh:${userId}:${refreshToken}`;
  const expiresIn = 7 * 24 * 60 * 60; // 7 days in seconds
  await redis.setex(key, expiresIn, 'valid');
}

async function validateRefreshToken(userId: string, refreshToken: string): Promise<boolean> {
  const redis = getRedisClient();
  const key = `refresh:${userId}:${refreshToken}`;
  const value = await redis.get(key);
  return value === 'valid';
}

async function invalidateRefreshToken(userId: string, refreshToken: string): Promise<void> {
  const redis = getRedisClient();
  const key = `refresh:${userId}:${refreshToken}`;
  await redis.del(key);
}

export async function register(
  input: RegisterInput
): Promise<{ user: IUser; tokens: AuthTokens }> {
  const existingUser = await User.findOne({ email: input.email.toLowerCase() });

  if (existingUser) {
    throw new HTTPException(409, { message: 'Email already registered' });
  }

  const passwordHash = await hashPassword(input.password);

  const user = await User.create({
    email: input.email.toLowerCase(),
    name: input.name,
    passwordHash,
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();
  await saveRefreshToken(user._id.toString(), refreshToken);

  return {
    user,
    tokens: {
      accessToken,
      refreshToken,
      expiresIn: parseExpiresIn(config.JWT_EXPIRES_IN),
    },
  };
}

export async function login(input: LoginInput): Promise<{ user: IUser; tokens: AuthTokens }> {
  const user = await User.findOne({ email: input.email.toLowerCase() });

  if (!user) {
    throw new HTTPException(401, { message: 'Invalid email or password' });
  }

  if (!user.isActive) {
    throw new HTTPException(401, { message: 'Account is inactive' });
  }

  const isValid = await comparePassword(input.password, user.passwordHash);

  if (!isValid) {
    throw new HTTPException(401, { message: 'Invalid email or password' });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();
  await saveRefreshToken(user._id.toString(), refreshToken);

  return {
    user,
    tokens: {
      accessToken,
      refreshToken,
      expiresIn: parseExpiresIn(config.JWT_EXPIRES_IN),
    },
  };
}

export async function refreshAccessToken(
  userId: string,
  refreshToken: string
): Promise<AuthTokens> {
  const isValid = await validateRefreshToken(userId, refreshToken);

  if (!isValid) {
    throw new HTTPException(401, { message: 'Invalid refresh token' });
  }

  const user = await User.findById(userId);

  if (!user || !user.isActive) {
    throw new HTTPException(401, { message: 'User not found or inactive' });
  }

  // Invalidate old refresh token
  await invalidateRefreshToken(userId, refreshToken);

  // Generate new tokens
  const accessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken();
  await saveRefreshToken(userId, newRefreshToken);

  return {
    accessToken,
    refreshToken: newRefreshToken,
    expiresIn: parseExpiresIn(config.JWT_EXPIRES_IN),
  };
}

export async function logout(userId: string, refreshToken: string): Promise<void> {
  await invalidateRefreshToken(userId, refreshToken);
}

// Helper to convert JWT expiry string to seconds
function parseExpiresIn(expiresIn: string): number {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) return 900; // default 15 minutes

  const value = parseInt(match[1]!, 10);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 60 * 60;
    case 'd':
      return value * 24 * 60 * 60;
    default:
      return 900;
  }
}
