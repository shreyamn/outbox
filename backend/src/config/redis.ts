import IORedis from 'ioredis';
import { env } from '../config/env';

let redisInstance: IORedis | null = null;

export function getRedis(): IORedis {
  if (!redisInstance) {
    redisInstance = new IORedis(env.REDIS_URL, {
      maxRetriesPerRequest: null, // Required by BullMQ
      enableReadyCheck: false,
      lazyConnect: false,
    });

    redisInstance.on('connect', () => console.log('✅ Redis connected'));
    redisInstance.on('error', (err) => console.error('❌ Redis error:', err.message));
  }
  return redisInstance;
}

/** Create a fresh IORedis connection (needed for BullMQ workers/queues) */
export function createRedisConnection(): IORedis {
  return new IORedis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });
}
