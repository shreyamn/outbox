import { Queue, QueueOptions } from 'bullmq';
import { createRedisConnection } from '../config/redis';
import { env } from '../config/env';

export const EMAIL_QUEUE_NAME = 'email-jobs';

const connection = createRedisConnection();

const queueOptions: QueueOptions = {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: { count: 100, age: 86400 }, // keep last 100 completed, max 1 day
    removeOnFail: { count: 500, age: 7 * 86400 },  // keep last 500 failed, max 7 days
  },
};

export const emailQueue = new Queue(EMAIL_QUEUE_NAME, queueOptions);

/**
 * Schedule an email job with a deterministic job ID for idempotency.
 * BullMQ will NOT add a duplicate job if the same jobId already exists in the queue.
 *
 * @param emailJobId  - PostgreSQL EmailJob.id
 * @param delayMs     - milliseconds from now before the job should run
 */
export async function scheduleEmailJob(
  emailJobId: string,
  delayMs: number
): Promise<void> {
  await emailQueue.add(
    'send-email',
    { emailJobId },
    {
      jobId: emailJobId, // deterministic — prevents duplicates on restart
      delay: Math.max(0, delayMs),
    }
  );
}
