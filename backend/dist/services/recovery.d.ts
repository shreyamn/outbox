/**
 * On startup, re-queue any SCHEDULED jobs whose BullMQ entry may have been lost.
 * This handles the restart recovery requirement:
 *   - Jobs still in SCHEDULED state in PG but not in Redis get re-enqueued.
 *   - BullMQ deduplication (deterministic jobId) prevents double-processing.
 *   - Jobs already in SENT/FAILED are skipped entirely.
 */
export declare function recoverScheduledJobs(): Promise<void>;
//# sourceMappingURL=recovery.d.ts.map