"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailQueue = exports.EMAIL_QUEUE_NAME = void 0;
exports.scheduleEmailJob = scheduleEmailJob;
const bullmq_1 = require("bullmq");
const redis_1 = require("../config/redis");
exports.EMAIL_QUEUE_NAME = 'email-jobs';
const connection = (0, redis_1.createRedisConnection)();
const queueOptions = {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 5000,
        },
        removeOnComplete: { count: 100, age: 86400 }, // keep last 100 completed, max 1 day
        removeOnFail: { count: 500, age: 7 * 86400 }, // keep last 500 failed, max 7 days
    },
};
exports.emailQueue = new bullmq_1.Queue(exports.EMAIL_QUEUE_NAME, queueOptions);
/**
 * Schedule an email job with a deterministic job ID for idempotency.
 * BullMQ will NOT add a duplicate job if the same jobId already exists in the queue.
 *
 * @param emailJobId  - PostgreSQL EmailJob.id
 * @param delayMs     - milliseconds from now before the job should run
 */
async function scheduleEmailJob(emailJobId, delayMs) {
    await exports.emailQueue.add('send-email', { emailJobId }, {
        jobId: emailJobId, // deterministic — prevents duplicates on restart
        delay: Math.max(0, delayMs),
    });
}
//# sourceMappingURL=emailQueue.js.map