import { Redis } from '@upstash/redis';

const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

let redisInstance: Redis;

const isRedisConfigured = UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN && UPSTASH_REDIS_REST_URL !== "disabled";

if (isRedisConfigured) {
  redisInstance = new Redis({
    url: UPSTASH_REDIS_REST_URL as string, // Cast to string as we've checked for "disabled"
    token: UPSTASH_REDIS_REST_TOKEN as string, // Cast to string
  });
} else {
  console.warn('UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN is not set or is "disabled". Redis functionality will be disabled.');
  redisInstance = {
    get: async (key: string) => {
      console.warn(`Redis is disabled. Attempted to get key: ${key}`);
      return null;
    },
    setex: async (key: string, ttl: number, value: any) => {
      console.warn(`Redis is disabled. Attempted to set key: ${key} with TTL: ${ttl}`);
    },
    // Add other methods if they are used in the application and need to be mocked
  } as any; // Cast to any to satisfy Redis type
}

export const redis = redisInstance;
