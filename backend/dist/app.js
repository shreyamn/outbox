"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const passport_1 = __importDefault(require("passport"));
const api_1 = require("@bull-board/api");
const bullMQAdapter_1 = require("@bull-board/api/bullMQAdapter");
const express_2 = require("@bull-board/express");
const env_1 = require("./config/env");
const passport_2 = require("./config/passport");
const emailQueue_1 = require("./queues/emailQueue");
const auth_1 = __importDefault(require("./routes/auth"));
const emails_1 = __importDefault(require("./routes/emails"));
const slack_1 = __importDefault(require("./routes/slack"));
function createApp() {
    const app = (0, express_1.default)();
    // ── Security / parsing middleware ─────────────────────────────────────────
    app.use((0, helmet_1.default)({ contentSecurityPolicy: false }));
    app.use((0, cors_1.default)({
        origin: env_1.env.FRONTEND_URL,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    }));
    app.use((0, morgan_1.default)('dev'));
    app.use(express_1.default.json({ limit: '10mb' }));
    app.use(express_1.default.urlencoded({ extended: true }));
    // ── Passport ──────────────────────────────────────────────────────────────
    (0, passport_2.configurePassport)();
    app.use(passport_1.default.initialize());
    // ── Bull Board ────────────────────────────────────────────────────────────
    const serverAdapter = new express_2.ExpressAdapter();
    serverAdapter.setBasePath('/admin/queues');
    (0, api_1.createBullBoard)({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore — version mismatch between @bull-board/api and bullmq types
        queues: [new bullMQAdapter_1.BullMQAdapter(emailQueue_1.emailQueue)],
        serverAdapter,
    });
    app.use('/admin/queues', serverAdapter.getRouter());
    // ── API Routes ────────────────────────────────────────────────────────────
    app.use('/api/auth', auth_1.default);
    app.use('/api/emails', emails_1.default);
    app.use('/api/slack', slack_1.default);
    // ── Health Check ──────────────────────────────────────────────────────────
    app.get('/health', (_req, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
    // ── 404 Handler ───────────────────────────────────────────────────────────
    app.use((_req, res) => {
        res.status(404).json({ error: 'Not found' });
    });
    // ── Error Handler ─────────────────────────────────────────────────────────
    app.use((err, _req, res, _next) => {
        console.error('[Error]', err);
        res.status(500).json({ error: 'Internal server error' });
    });
    return app;
}
//# sourceMappingURL=app.js.map