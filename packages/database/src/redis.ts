import Redis, { type RedisOptions } from 'ioredis';

let redisClient: Redis | null = null;

export interface RedisConfig {
  url: string;
  options?: RedisOptions;
}

export function getRedisClient(config?: RedisConfig): Redis {
  if (!redisClient) {
    if (!config) {
      throw new Error('Redis client not initialized. Call initRedis first.');
    }

    redisClient = new Redis(config.url, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      ...config.options,
    });

    redisClient.on('connect', () => {
      console.log('Connected to Redis');
    });

    redisClient.on('error', (error) => {
      console.error('Redis connection error:', error);
    });
  }

  return redisClient;
}

export function initRedis(config: RedisConfig): Redis {
  return getRedisClient(config);
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log('Disconnected from Redis');
  }
}

export function isRedisConnected(): boolean {
  return redisClient !== null && redisClient.status === 'ready';
}
