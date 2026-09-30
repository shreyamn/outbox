"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
exports.scheduleEmails = scheduleEmails;
exports.parseEmailsCsv = parseEmailsCsv;
exports.getScheduledEmails = getScheduledEmails;
exports.getSentEmails = getSentEmails;
exports.cancelEmailJob = cancelEmailJob;
const multer_1 = __importDefault(require("multer"));
const zod_1 = require("zod");
const prisma_1 = require("../db/prisma");
const csvParser_1 = require("../services/csvParser");
const emailQueue_1 = require("../queues/emailQueue");
const elasticsearch_1 = require("../search/elasticsearch");
const env_1 = require("../config/env");
// Memory storage — CSV is parsed and discarded, never persisted to disk
exports.upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const composeSchema = zod_1.z.object({
    subject: zod_1.z.string().min(1).max(500),
    body: zod_1.z.string().min(1),
    startTime: zod_1.z.string().datetime(),
    delayBetweenMs: zod_1.z.coerce.number().min(0).default(env_1.env.MIN_EMAIL_DELAY_MS),
});
async function scheduleEmails(req, res) {
    try {
        const parsed = composeSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: 'Validation failed', details: parsed.error.format() });
            return;
        }
        const { subject, body, startTime, delayBetweenMs } = parsed.data;
        const userId = req.jwtUser.userId;
        // Parse CSV
        if (!req.file) {
            res.status(400).json({ error: 'CSV file is required' });
            return;
        }
        const recipients = (0, csvParser_1.parseEmailsFromCsv)(req.file.buffer);
        if (recipients.length === 0) {
            res.status(400).json({ error: 'No valid email addresses found in CSV' });
            return;
        }
        const startMs = new Date(startTime).getTime();
        const createdJobs = [];
        for (let i = 0; i < recipients.length; i++) {
            const { email, name } = recipients[i];
            const scheduledAt = new Date(startMs + i * delayBetweenMs);
            // Create in PostgreSQL first
            const job = await prisma_1.prisma.emailJob.create({
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
            await (0, emailQueue_1.scheduleEmailJob)(job.id, delayFromNow);
            // Index in Elasticsearch (non-blocking)
            (0, elasticsearch_1.indexEmailJob)({
                jobId: job.id,
                userId,
                toEmail: email,
                subject,
                status: 'SCHEDULED',
                scheduledAt,
            }).catch(() => { });
            createdJobs.push(job.id);
        }
        res.status(201).json({
            message: `Scheduled ${createdJobs.length} emails`,
            count: createdJobs.length,
            jobIds: createdJobs,
        });
    }
    catch (err) {
        console.error('[scheduleEmails]', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function parseEmailsCsv(req, res) {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'CSV file is required' });
            return;
        }
        const recipients = (0, csvParser_1.parseEmailsFromCsv)(req.file.buffer);
        res.json({ count: recipients.length, preview: recipients.slice(0, 5) });
    }
    catch (err) {
        res.status(400).json({ error: 'Failed to parse CSV' });
    }
}
async function getScheduledEmails(req, res) {
    try {
        const userId = req.jwtUser.userId;
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, parseInt(req.query.limit) || 20);
        const skip = (page - 1) * limit;
        const [jobs, total] = await Promise.all([
            prisma_1.prisma.emailJob.findMany({
                where: { userId, status: { in: ['SCHEDULED', 'PROCESSING'] } },
                orderBy: { scheduledAt: 'asc' },
                skip,
                take: limit,
                select: {
                    id: true, toEmail: true, toName: true, subject: true,
                    status: true, scheduledAt: true, retryCount: true, createdAt: true,
                },
            }),
            prisma_1.prisma.emailJob.count({ where: { userId, status: { in: ['SCHEDULED', 'PROCESSING'] } } }),
        ]);
        res.json({ jobs, total, page, limit });
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function getSentEmails(req, res) {
    try {
        const userId = req.jwtUser.userId;
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, parseInt(req.query.limit) || 20);
        const skip = (page - 1) * limit;
        const [jobs, total] = await Promise.all([
            prisma_1.prisma.emailJob.findMany({
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
            prisma_1.prisma.emailJob.count({ where: { userId, status: { in: ['SENT', 'FAILED'] } } }),
        ]);
        res.json({ jobs, total, page, limit });
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function cancelEmailJob(req, res) {
    try {
        const userId = req.jwtUser.userId;
        const { id } = req.params;
        const job = await prisma_1.prisma.emailJob.findFirst({ where: { id, userId } });
        if (!job) {
            res.status(404).json({ error: 'Job not found' });
            return;
        }
        if (job.status !== 'SCHEDULED') {
            res.status(400).json({ error: `Cannot cancel a job in status: ${job.status}` });
            return;
        }
        await prisma_1.prisma.emailJob.update({
            where: { id },
            data: { status: 'FAILED', failReason: 'Cancelled by user', failedAt: new Date() },
        });
        res.json({ message: 'Job cancelled' });
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
}
//# sourceMappingURL=emailController.js.map