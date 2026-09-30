import { Queue } from 'bullmq';
export declare const EMAIL_QUEUE_NAME = "email-jobs";
export declare const emailQueue: Queue<any, any, string, any, any, string>;
/**
 * Schedule an email job with a deterministic job ID for idempotency.
 * BullMQ will NOT add a duplicate job if the same jobId already exists in the queue.
 *
 * @param emailJobId  - PostgreSQL EmailJob.id
 * @param delayMs     - milliseconds from now before the job should run
 */
export declare function scheduleEmailJob(emailJobId: string, delayMs: number): Promise<void>;
//# sourceMappingURL=emailQueue.d.ts.map