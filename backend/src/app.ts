import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import passport from 'passport';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';

import { env } from './config/env';
import { configurePassport } from './config/passport';
import { emailQueue } from './queues/emailQueue';
import authRouter from './routes/auth';
import emailsRouter from './routes/emails';
import slackRouter from './routes/slack';

export function createApp(): express.Application {
  const app = express();

  // ── Security / parsing middleware ─────────────────────────────────────────
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
  app.use(morgan('dev'));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // ── Passport ──────────────────────────────────────────────────────────────
  configurePassport();
  app.use(passport.initialize());

  // ── Bull Board ────────────────────────────────────────────────────────────
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');
  createBullBoard({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore — version mismatch between @bull-board/api and bullmq types
    queues: [new BullMQAdapter(emailQueue)],
    serverAdapter,
  });
  app.use('/admin/queues', serverAdapter.getRouter());

  // ── API Routes ────────────────────────────────────────────────────────────
  app.use('/api/auth', authRouter);
  app.use('/api/emails', emailsRouter);
  app.use('/api/slack', slackRouter);

  // ── Health Check ──────────────────────────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ── 404 Handler ───────────────────────────────────────────────────────────
  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  // ── Error Handler ─────────────────────────────────────────────────────────
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[Error]', err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}
