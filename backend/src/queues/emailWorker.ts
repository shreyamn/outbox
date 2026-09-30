import { Worker, Job } from 'bullmq';
import { createRedisConnection } from '../config/redis';
import { prisma } from '../db/prisma';
import { sendEmail } from '../services/mailer';
import { checkAndConsumeRateLimit, getNextAvailableWindow } from '../services/rateLimiter';
import { scheduleEmailJob } from './emailQueue';
import { updateEmailJobStatus } from '../search/elasticsearch';
import { notifySlackRateLimit } from '../services/slack';
import { env } from '../config/env';

interface EmailJobPayload {
  emailJobId: string;
}

async function processEmailJob(job: Job<EmailJobPayload>): Promise<void> {
  const { emailJobId } = job.data;

  // ── 1. Load from PostgreSQL (source of truth) ──────────────────────────────
  const emailJob = await prisma.emailJob.findUnique({ where: { id: emailJobId } });
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
  const updated = await prisma.emailJob.updateMany({
    where: { id: emailJobId, status: { in: ['SCHEDULED'] } },
    data: { status: 'PROCESSING' },
  });
  if (updated.count === 0) {
    // Another worker already picked this up
    console.warn(`[Worker] Job ${emailJobId} already processing — skipping`);
    return;
  }

  // ── 4. Rate limit check ─────────────────────────────────────────────────────
  const { allowed, current, resetAt } = await checkAndConsumeRateLimit(emailJob.userId);
  if (!allowed) {
    console.log(`[Worker] Rate limit hit for user ${emailJob.userId} (${current}/${env.MAX_EMAILS_PER_HOUR})`);

    // Reschedule to next available window
    const nextAt = await getNextAvailableWindow(emailJob.userId);
    const delayMs = Math.max(0, nextAt.getTime() - Date.now());

    await prisma.emailJob.update({
      where: { id: emailJobId },
      data: { status: 'SCHEDULED', scheduledAt: nextAt },
    });

    await scheduleEmailJob(emailJobId, delayMs);

    // Notify Slack
    await notifySlackRateLimit(emailJob.userId, resetAt, env.MAX_EMAILS_PER_HOUR).catch(() => {});

    return;
  }

  // ── 5. Add configurable delay between emails ──────────────────────────────────
  if (env.MIN_EMAIL_DELAY_MS > 0) {
    await new Promise((r) => setTimeout(r, env.MIN_EMAIL_DELAY_MS));
  }

  // ── 6. Send email via Ethereal ───────────────────────────────────────────────
  try {
    const messageId = await sendEmail({
      to: emailJob.toEmail,
      toName: emailJob.toName ?? undefined,
      subject: emailJob.subject,
      html: emailJob.body,
    });

    const now = new Date();
    await prisma.emailJob.update({
      where: { id: emailJobId },
      data: { status: 'SENT', sentAt: now, messageId },
    });

    await updateEmailJobStatus(emailJobId, 'SENT', now);
    console.log(`[Worker] ✅ Sent email ${emailJobId} to ${emailJob.toEmail}`);
  } catch (err) {
    const reason = (err as Error).message;
    await prisma.emailJob.update({
      where: { id: emailJobId },
      data: { status: 'FAILED', failedAt: new Date(), failReason: reason },
    });
    await updateEmailJobStatus(emailJobId, 'FAILED');
    throw err; // Let BullMQ retry
  }
}

export function startWorker(): Worker<EmailJobPayload> {
  const worker = new Worker<EmailJobPayload>(
    'email-jobs',
    processEmailJob,
    {
      connection: createRedisConnection(),
      concurrency: env.WORKER_CONCURRENCY,
    }
  );

  worker.on('completed', (job) => {
    console.log(`[Worker] Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed:`, err.message);
  });

  worker.on('stalled', (jobId) => {
    console.warn(`[Worker] Job ${jobId} stalled — will be retried`);
  });

  console.log(`✅ Email worker started (concurrency=${env.WORKER_CONCURRENCY})`);
  return worker;
}
