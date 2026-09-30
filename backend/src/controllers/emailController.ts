import { Request, Response } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { prisma } from '../db/prisma';
import { parseEmailsFromCsv } from '../services/csvParser';
import { scheduleEmailJob } from '../queues/emailQueue';
import { indexEmailJob } from '../search/elasticsearch';
import { env } from '../config/env';

// Memory storage — CSV is parsed and discarded, never persisted to disk
export const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const composeSchema = z.object({
  subject: z.string().min(1).max(500),
  body: z.string().min(1),
  startTime: z.string().datetime(),
  delayBetweenMs: z.coerce.number().min(0).default(env.MIN_EMAIL_DELAY_MS),
});

export async function scheduleEmails(req: Request, res: Response): Promise<void> {
  try {
    const parsed = composeSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.format() });
      return;
    }

    const { subject, body, startTime, delayBetweenMs } = parsed.data;
    const userId = req.jwtUser!.userId;

    // Parse CSV
    if (!req.file) {
      res.status(400).json({ error: 'CSV file is required' });
      return;
    }

    const recipients = parseEmailsFromCsv(req.file.buffer);
    if (recipients.length === 0) {
      res.status(400).json({ error: 'No valid email addresses found in CSV' });
      return;
    }

    const startMs = new Date(startTime).getTime();
    const createdJobs: string[] = [];

    for (let i = 0; i < recipients.length; i++) {
      const { email, name } = recipients[i];
      const scheduledAt = new Date(startMs + i * delayBetweenMs);

      // Create in PostgreSQL first
      const job = await prisma.emailJob.create({
        data: {
          userId,
          toEmail: email,
          toName: name,
          subject,
          body,
          status: 'SCHEDULED',
          scheduledAt,
        },
      });

      // Schedule in BullMQ with deterministic job ID
      const delayFromNow = Math.max(0, scheduledAt.getTime() - Date.now());
      await scheduleEmailJob(job.id, delayFromNow);

      // Index in Elasticsearch (non-blocking)
      indexEmailJob({
        jobId: job.id,
        userId,
        toEmail: email,
        subject,
        status: 'SCHEDULED',
        scheduledAt,
      }).catch(() => {});

      createdJobs.push(job.id);
    }

    res.status(201).json({
      message: `Scheduled ${createdJobs.length} emails`,
      count: createdJobs.length,
      jobIds: createdJobs,
    });
  } catch (err) {
    console.error('[scheduleEmails]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function parseEmailsCsv(req: Request, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'CSV file is required' });
      return;
    }
    const recipients = parseEmailsFromCsv(req.file.buffer);
    res.json({ count: recipients.length, preview: recipients.slice(0, 5) });
  } catch (err) {
    res.status(400).json({ error: 'Failed to parse CSV' });
  }
}

export async function getScheduledEmails(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.jwtUser!.userId;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      prisma.emailJob.findMany({
        where: { userId, status: { in: ['SCHEDULED', 'PROCESSING'] } },
        orderBy: { scheduledAt: 'asc' },
        skip,
        take: limit,
        select: {
          id: true, toEmail: true, toName: true, subject: true,
          status: true, scheduledAt: true, retryCount: true, createdAt: true,
        },
      }),
      prisma.emailJob.count({ where: { userId, status: { in: ['SCHEDULED', 'PROCESSING'] } } }),
    ]);

    res.json({ jobs, total, page, limit });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getSentEmails(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.jwtUser!.userId;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      prisma.emailJob.findMany({
        where: { userId, status: { in: ['SENT', 'FAILED'] } },
        orderBy: { sentAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true, toEmail: true, toName: true, subject: true,
          status: true, scheduledAt: true, sentAt: true, failReason: true,
          messageId: true, createdAt: true,
        },
      }),
      prisma.emailJob.count({ where: { userId, status: { in: ['SENT', 'FAILED'] } } }),
    ]);

    res.json({ jobs, total, page, limit });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function cancelEmailJob(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.jwtUser!.userId;
    const { id } = req.params;

    const job = await prisma.emailJob.findFirst({ where: { id, userId } });
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }
    if (job.status !== 'SCHEDULED') {
      res.status(400).json({ error: `Cannot cancel a job in status: ${job.status}` });
      return;
    }

    await prisma.emailJob.update({
      where: { id },
      data: { status: 'FAILED', failReason: 'Cancelled by user', failedAt: new Date() },
    });

    res.json({ message: 'Job cancelled' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
