import jwt from 'jsonwebtoken';
import { HTTPException } from 'hono/http-exception';
import { config } from '../config/index.js';
import { getRedisClient, User, type IUser } from '@scrapepilot/database';
import { hashPassword, comparePassword, generateRefreshToken } from '../utils/crypto.js';
import type { RegisterInput, LoginInput, AuthTokens, GoogleAuthInput } from '@scrapepilot/shared';

interface GoogleTokenPayload {
  sub: string; // Google user ID
  email: string;
  email_verified: boolean;
  name: string;
  picture?: string;
}

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

  // Check if user has a password (OAuth users don't)
  if (!user.passwordHash) {
    throw new HTTPException(401, { message: 'Please use Google to sign in' });
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

// Google OAuth authentication
export async function googleAuth(
  input: GoogleAuthInput
): Promise<{ user: IUser; tokens: AuthTokens }> {
  // Decode the Google ID token (credential)
  // The token is a JWT signed by Google
  const tokenParts = input.credential.split('.');
  if (tokenParts.length !== 3) {
    throw new HTTPException(400, { message: 'Invalid Google credential' });
  }

  let payload: GoogleTokenPayload;
  try {
    const payloadBase64 = tokenParts[1]!;
    const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf8');
    payload = JSON.parse(payloadJson) as GoogleTokenPayload;
  } catch {
    throw new HTTPException(400, { message: 'Failed to decode Google credential' });
  }

  if (!payload.email || !payload.sub) {
    throw new HTTPException(400, { message: 'Invalid Google token payload' });
  }

  // Find or create user
  let user = await User.findOne({
    $or: [{ googleId: payload.sub }, { email: payload.email.toLowerCase() }],
  });

  if (user) {
    // User exists - update Google ID if not set
    if (!user.googleId) {
      user.googleId = payload.sub;
      user.authProvider = 'google';
      if (payload.picture) {
        user.avatarUrl = payload.picture;
      }
      await user.save();
    }

    if (!user.isActive) {
      throw new HTTPException(401, { message: 'Account is inactive' });
    }
  } else {
    // Create new user
    user = await User.create({
      email: payload.email.toLowerCase(),
      name: payload.name || payload.email.split('@')[0],
      googleId: payload.sub,
      authProvider: 'google',
      avatarUrl: payload.picture,
    });
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
