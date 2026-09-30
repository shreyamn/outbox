/**
 * Returns the Redis key for a sender's hourly rate limit bucket.
 * The window is the current hour (floored to hour boundary).
 */
export declare function rateLimitKey(userId: string, hourWindow?: number): string;
/**
 * Atomically increments the rate limit counter for the current hour.
 * Returns { allowed, current, resetAt }
 */
export declare function checkAndConsumeRateLimit(userId: string): Promise<{
    allowed: boolean;
    current: number;
    resetAt: Date;
}>;
/**
 * Get next available hour window where the rate limit is not yet exceeded.
 * Scans ahead up to 24 hours.
 */
export declare function getNextAvailableWindow(userId: string): Promise<Date>;
//# sourceMappingURL=rateLimiter.d.ts.map