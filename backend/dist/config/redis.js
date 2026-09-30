"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRedis = getRedis;
exports.createRedisConnection = createRedisConnection;
const ioredis_1 = __importDefault(require("ioredis"));
const env_1 = require("../config/env");
let redisInstance = null;
function getRedis() {
    if (!redisInstance) {
        redisInstance = new ioredis_1.default(env_1.env.REDIS_URL, {
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
function createRedisConnection() {
    return new ioredis_1.default(env_1.env.REDIS_URL, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
    });
}
//# sourceMappingURL=redis.js.map