import { prisma } from '../db/prisma';
import { scheduleEmailJob } from '../queues/emailQueue';
import { emailQueue } from '../queues/emailQueue';

/**
 * On startup, re-queue any SCHEDULED jobs whose BullMQ entry may have been lost.
 * This handles the restart recovery requirement:
 *   - Jobs still in SCHEDULED state in PG but not in Redis get re-enqueued.
 *   - BullMQ deduplication (deterministic jobId) prevents double-processing.
 *   - Jobs already in SENT/FAILED are skipped entirely.
 */
export async function recoverScheduledJobs(): Promise<void> {
  console.log('[Recovery] Scanning for scheduled jobs to recover...');

  const jobs = await prisma.emailJob.findMany({
    where: {
      status: { in: ['SCHEDULED', 'PROCESSING'] },
    },
    select: { id: true, scheduledAt: true, status: true },
  });

  if (jobs.length === 0) {
    console.log('[Recovery] No jobs to recover');
    return;
  }

  let recovered = 0;
  const now = Date.now();

  for (const job of jobs) {
    // Check if job already exists in BullMQ
    const existing = await emailQueue.getJob(job.id);
    if (existing) {
      // Already in queue — skip
      continue;
    }

    // If job was stuck in PROCESSING, reset to SCHEDULED
    if (job.status === 'PROCESSING') {
      await prisma.emailJob.update({
        where: { id: job.id },
        data: { status: 'SCHEDULED' },
      });
    }

    const delayMs = Math.max(0, job.scheduledAt.getTime() - now);
    await scheduleEmailJob(job.id, delayMs);
    recovered++;
  }

  console.log(`[Recovery] ✅ Recovered ${recovered}/${jobs.length} jobs`);
}
