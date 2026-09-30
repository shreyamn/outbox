import './config/env'; // Validate env first
import { createApp } from './app';
import { prisma } from './db/prisma';
import { getRedis } from './config/redis';
import { ensureEmailIndex } from './search/elasticsearch';
import { startWorker } from './queues/emailWorker';
import { recoverScheduledJobs } from './services/recovery';
import { env } from './config/env';

async function bootstrap(): Promise<void> {
  // ── 1. Verify DB connection ───────────────────────────────────────────────
  await prisma.$connect();
  console.log('✅ PostgreSQL connected');

  // ── 2. Verify Redis ───────────────────────────────────────────────────────
  const redis = getRedis();
  await redis.ping();
  console.log('✅ Redis connected');

  // ── 3. Ensure Elasticsearch index ─────────────────────────────────────────
  await ensureEmailIndex();

  // ── 4. Start BullMQ worker ────────────────────────────────────────────────
  startWorker();

  // ── 5. Recover any jobs that survived a restart ───────────────────────────
  await recoverScheduledJobs();

  // ── 6. Start Express ──────────────────────────────────────────────────────
  const app = createApp();
  const server = app.listen(env.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${env.PORT}`);
    console.log(`📊 Bull Board: http://localhost:${env.PORT}/admin/queues`);
    console.log(`🏥 Health:     http://localhost:${env.PORT}/health`);
  });

  // ── Graceful shutdown ─────────────────────────────────────────────────────
  const shutdown = async () => {
    console.log('Shutting down...');
    server.close();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

bootstrap().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
