"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: '../.env' });
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.coerce.number().default(4000),
    DATABASE_URL: zod_1.z.string().min(1),
    REDIS_URL: zod_1.z.string().default('redis://localhost:6379'),
    ELASTICSEARCH_URL: zod_1.z.string().default('http://localhost:9200'),
    JWT_SECRET: zod_1.z.string().min(16),
    JWT_EXPIRES_IN: zod_1.z.string().default('7d'),
    GOOGLE_CLIENT_ID: zod_1.z.string().min(1),
    GOOGLE_CLIENT_SECRET: zod_1.z.string().min(1),
    GOOGLE_CALLBACK_URL: zod_1.z.string().url(),
    SLACK_CLIENT_ID: zod_1.z.string().optional(),
    SLACK_CLIENT_SECRET: zod_1.z.string().optional(),
    SLACK_REDIRECT_URI: zod_1.z.string().optional(),
    ETHEREAL_USER: zod_1.z.string().optional(),
    ETHEREAL_PASS: zod_1.z.string().optional(),
    WORKER_CONCURRENCY: zod_1.z.coerce.number().min(1).max(50).default(5),
    MIN_EMAIL_DELAY_MS: zod_1.z.coerce.number().min(0).default(2000),
    MAX_EMAILS_PER_HOUR: zod_1.z.coerce.number().min(1).default(100),
    FRONTEND_URL: zod_1.z.string().default('http://localhost:5173'),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.format());
    process.exit(1);
}
exports.env = parsed.data;
//# sourceMappingURL=env.js.map