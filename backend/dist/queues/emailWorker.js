"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startWorker = startWorker;
const bullmq_1 = require("bullmq");
const redis_1 = require("../config/redis");
const prisma_1 = require("../db/prisma");
const mailer_1 = require("../services/mailer");
const rateLimiter_1 = require("../services/rateLimiter");
const emailQueue_1 = require("./emailQueue");
const elasticsearch_1 = require("../search/elasticsearch");
const slack_1 = require("../services/slack");
const env_1 = require("../config/env");
async function processEmailJob(job) {
    const { emailJobId } = job.data;
    // ── 1. Load from PostgreSQL (source of truth) ──────────────────────────────
    const emailJob = await prisma_1.prisma.emailJob.findUnique({ where: { id: emailJobId } });
    if (!emailJob) {
        console.warn(`[Worker] Job ${emailJobId} not found in DB — skipping`);
        return;
    }
    // ── 2. Idempotency check — never send twice ─────────────────────────────────
    if (emailJob.status === 'SENT') {
        console.log(`[Worker] Job ${emailJobId} already SENT — skipping (idempotent)`);
        return;
    }
    if (emailJob.status === 'FAILED') {
        console.log(`[Worker] Job ${emailJobId} is FAILED — skipping`);
        return;
    }
    // ── 3. Mark as PROCESSING (optimistic lock) ──────────────────────────────────
    const updated = await prisma_1.prisma.emailJob.updateMany({
        where: { id: emailJobId, status: { in: ['SCHEDULED'] } },
        data: { status: 'PROCESSING' },
    });
    if (updated.count === 0) {
        // Another worker already picked this up
        console.warn(`[Worker] Job ${emailJobId} already processing — skipping`);
        return;
    }
    // ── 4. Rate limit check ─────────────────────────────────────────────────────
    const { allowed, current, resetAt } = await (0, rateLimiter_1.checkAndConsumeRateLimit)(emailJob.userId);
    if (!allowed) {
        console.log(`[Worker] Rate limit hit for user ${emailJob.userId} (${current}/${env_1.env.MAX_EMAILS_PER_HOUR})`);
        // Reschedule to next available window
        const nextAt = await (0, rateLimiter_1.getNextAvailableWindow)(emailJob.userId);
        const delayMs = Math.max(0, nextAt.getTime() - Date.now());
        await prisma_1.prisma.emailJob.update({
            where: { id: emailJobId },
            data: { status: 'SCHEDULED', scheduledAt: nextAt },
        });
        await (0, emailQueue_1.scheduleEmailJob)(emailJobId, delayMs);
        // Notify Slack
        await (0, slack_1.notifySlackRateLimit)(emailJob.userId, resetAt, env_1.env.MAX_EMAILS_PER_HOUR).catch(() => { });
        return;
    }
    // ── 5. Add configurable delay between emails ──────────────────────────────────
    if (env_1.env.MIN_EMAIL_DELAY_MS > 0) {
        await new Promise((r) => setTimeout(r, env_1.env.MIN_EMAIL_DELAY_MS));
    }
    // ── 6. Send email via Ethereal ───────────────────────────────────────────────
    try {
        const messageId = await (0, mailer_1.sendEmail)({
            to: emailJob.toEmail,
            toName: emailJob.toName ?? undefined,
            subject: emailJob.subject,
            html: emailJob.body,
        });
        const now = new Date();
        await prisma_1.prisma.emailJob.update({
            where: { id: emailJobId },
            data: { status: 'SENT', sentAt: now, messageId },
        });
        await (0, elasticsearch_1.updateEmailJobStatus)(emailJobId, 'SENT', now);
        console.log(`[Worker] ✅ Sent email ${emailJobId} to ${emailJob.toEmail}`);
    }
    catch (err) {
        const reason = err.message;
        await prisma_1.prisma.emailJob.update({
            where: { id: emailJobId },
            data: { status: 'FAILED', failedAt: new Date(), failReason: reason },
        });
        await (0, elasticsearch_1.updateEmailJobStatus)(emailJobId, 'FAILED');
        throw err; // Let BullMQ retry
    }
}
function startWorker() {
    const worker = new bullmq_1.Worker('email-jobs', processEmailJob, {
        connection: (0, redis_1.createRedisConnection)(),
        concurrency: env_1.env.WORKER_CONCURRENCY,
    });
    worker.on('completed', (job) => {
        console.log(`[Worker] Job ${job.id} completed`);
    });
    worker.on('failed', (job, err) => {
        console.error(`[Worker] Job ${job?.id} failed:`, err.message);
    });
    worker.on('stalled', (jobId) => {
        console.warn(`[Worker] Job ${jobId} stalled — will be retried`);
    });
    console.log(`✅ Email worker started (concurrency=${env_1.env.WORKER_CONCURRENCY})`);
    return worker;
}
//# sourceMappingURL=emailWorker.js.map