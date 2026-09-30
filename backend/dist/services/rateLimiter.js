"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimitKey = rateLimitKey;
exports.checkAndConsumeRateLimit = checkAndConsumeRateLimit;
exports.getNextAvailableWindow = getNextAvailableWindow;
const redis_1 = require("../config/redis");
const env_1 = require("../config/env");
const RATE_LIMIT_TTL_SECONDS = 3600; // 1 hour window
/**
 * Returns the Redis key for a sender's hourly rate limit bucket.
 * The window is the current hour (floored to hour boundary).
 */
function rateLimitKey(userId, hourWindow) {
    const window = hourWindow ?? Math.floor(Date.now() / 3_600_000);
    return `rate-limit:${userId}:${window}`;
}
/**
 * Atomically increments the rate limit counter for the current hour.
 * Returns { allowed, current, resetAt }
 */
async function checkAndConsumeRateLimit(userId) {
    const redis = (0, redis_1.getRedis)();
    const window = Math.floor(Date.now() / 3_600_000);
    const key = rateLimitKey(userId, window);
    // Lua script: INCR then EXPIRE (atomic)
    const script = `
    local current = redis.call('INCR', KEYS[1])
    if current == 1 then
      redis.call('EXPIRE', KEYS[1], ARGV[1])
    end
    return current
  `;
    const current = (await redis.eval(script, 1, key, String(RATE_LIMIT_TTL_SECONDS)));
    const max = env_1.env.MAX_EMAILS_PER_HOUR;
    const resetAt = new Date((window + 1) * 3_600_000);
    return { allowed: current <= max, current, resetAt };
}
/**
 * Get next available hour window where the rate limit is not yet exceeded.
 * Scans ahead up to 24 hours.
 */
async function getNextAvailableWindow(userId) {
    const redis = (0, redis_1.getRedis)();
    const now = Math.floor(Date.now() / 3_600_000);
    const max = env_1.env.MAX_EMAILS_PER_HOUR;
    for (let i = 0; i < 24; i++) {
        const window = now + i;
        const key = rateLimitKey(userId, window);
        const current = await redis.get(key);
        const count = current ? parseInt(current, 10) : 0;
        if (count < max) {
            // Schedule at start of that window + small buffer
            return new Date((window) * 3_600_000 + 60_000); // +1 min into that hour
        }
    }
    // Fallback: 24 hours from now
    return new Date(Date.now() + 24 * 3_600_000);
}
//# sourceMappingURL=rateLimiter.js.map