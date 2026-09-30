import IORedis from 'ioredis';
export declare function getRedis(): IORedis;
/** Create a fresh IORedis connection (needed for BullMQ workers/queues) */
export declare function createRedisConnection(): IORedis;
//# sourceMappingURL=redis.d.ts.map