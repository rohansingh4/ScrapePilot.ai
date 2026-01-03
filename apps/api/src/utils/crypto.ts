import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateApiKey(): { key: string; prefix: string; hash: string } {
  const randomBytes = crypto.randomBytes(32);
  const key = `sp_live_${randomBytes.toString('hex')}`;
  const prefix = key.substring(0, 15) + '...';
  const hash = crypto.createHash('sha256').update(key).digest('hex');

  return { key, prefix, hash };
}

export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex');
}
