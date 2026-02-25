import { redis } from './redis';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
}

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get<T>(key);
    return data;
  } catch (error) {
    console.error(`Error getting cache for key ${key}:`, error);
    return null;
  }
}

export async function setCache<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
  const ttl = options?.ttl || 60; // Default TTL is 60 seconds
  try {
    await redis.setex(key, ttl, value);
  } catch (error) {
    console.error(`Error setting cache for key ${key}:`, error);
  }
}
