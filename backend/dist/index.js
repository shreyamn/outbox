"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./config/env"); // Validate env first
const app_1 = require("./app");
const prisma_1 = require("./db/prisma");
const redis_1 = require("./config/redis");
const elasticsearch_1 = require("./search/elasticsearch");
const emailWorker_1 = require("./queues/emailWorker");
const recovery_1 = require("./services/recovery");
const env_1 = require("./config/env");
async function bootstrap() {
    // ── 1. Verify DB connection ───────────────────────────────────────────────
    await prisma_1.prisma.$connect();
    console.log('✅ PostgreSQL connected');
    // ── 2. Verify Redis ───────────────────────────────────────────────────────
    const redis = (0, redis_1.getRedis)();
    await redis.ping();
    console.log('✅ Redis connected');
    // ── 3. Ensure Elasticsearch index ─────────────────────────────────────────
    await (0, elasticsearch_1.ensureEmailIndex)();
    // ── 4. Start BullMQ worker ────────────────────────────────────────────────
    (0, emailWorker_1.startWorker)();
    // ── 5. Recover any jobs that survived a restart ───────────────────────────
    await (0, recovery_1.recoverScheduledJobs)();
    // ── 6. Start Express ──────────────────────────────────────────────────────
    const app = (0, app_1.createApp)();
    const server = app.listen(env_1.env.PORT, () => {
        console.log(`🚀 Server running on http://localhost:${env_1.env.PORT}`);
        console.log(`📊 Bull Board: http://localhost:${env_1.env.PORT}/admin/queues`);
        console.log(`🏥 Health:     http://localhost:${env_1.env.PORT}/health`);
    });
    // ── Graceful shutdown ─────────────────────────────────────────────────────
    const shutdown = async () => {
        console.log('Shutting down...');
        server.close();
        await prisma_1.prisma.$disconnect();
        process.exit(0);
    };
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
}
bootstrap().catch((err) => {
    console.error('Fatal startup error:', err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map