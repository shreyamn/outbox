# ReachInbox — Email Scheduling Platform

A production-quality full-stack email scheduling platform built for the ReachInbox hiring assignment.

## 🏗️ Architecture

```
React (Vite + Tailwind)
        ↓
Express API (TypeScript)
        ↓
PostgreSQL (Prisma) ←→ Elasticsearch (search index)
        ↓
BullMQ (Redis) → Worker → Ethereal SMTP
        ↓
Slack OAuth (rate-limit notifications)
```

## ✨ Features

| Feature | Status |
|---|---|
| Google OAuth login | ✅ |
| User dashboard | ✅ |
| Schedule emails (CSV upload) | ✅ |
| BullMQ delayed jobs (no cron/polling) | ✅ |
| Redis persistence | ✅ |
| PostgreSQL source of truth | ✅ |
| Ethereal SMTP sending | ✅ |
| Configurable worker concurrency | ✅ |
| Configurable delay between emails | ✅ |
| Redis-backed hourly rate limiting | ✅ |
| Rescheduling when hourly limit reached | ✅ |
| Idempotent email sending | ✅ |
| Restart recovery | ✅ |
| Elasticsearch indexing/search | ✅ |
| Bull Board UI | ✅ |
| Slack OAuth | ✅ |
| Slack notification on rate limit | ✅ |
| Scheduled email table | ✅ |
| Sent email table | ✅ |
| Loading/empty/error states | ✅ |
| Storage-efficient architecture | ✅ |

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- Google OAuth credentials
- (Optional) Slack OAuth app

### 1. Clone and configure
```bash
git clone <repo>
cd reachinbox
cp .env.example .env
# Edit .env — set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, JWT_SECRET
```

### 2. Start infrastructure
```bash
docker compose up -d
```
This starts PostgreSQL, Redis, and Elasticsearch.

### 3. Set up backend
```bash
cd backend
npm install
npm run prisma:push       # Apply schema to DB
npm run dev               # Start dev server
```

### 4. Start frontend
```bash
cd frontend
npm install
npm run dev
```

### 5. Access the app
| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| API | http://localhost:4000 |
| Bull Board | http://localhost:4000/admin/queues |
| Health | http://localhost:4000/health |

## 🔧 Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | — | PostgreSQL connection string |
| `REDIS_URL` | `redis://localhost:6379` | Redis URL |
| `ELASTICSEARCH_URL` | `http://localhost:9200` | Elasticsearch URL |
| `JWT_SECRET` | — | Secret for JWT signing |
| `GOOGLE_CLIENT_ID` | — | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | — | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | `http://localhost:4000/api/auth/google/callback` | OAuth callback |
| `SLACK_CLIENT_ID` | optional | Slack OAuth app client ID |
| `SLACK_CLIENT_SECRET` | optional | Slack OAuth app secret |
| `WORKER_CONCURRENCY` | `5` | Number of parallel email workers |
| `MIN_EMAIL_DELAY_MS` | `2000` | Min delay between emails (ms) |
| `MAX_EMAILS_PER_HOUR` | `100` | Hourly send limit per user |
| `ETHEREAL_USER` | auto | Ethereal SMTP user (auto-created) |
| `ETHEREAL_PASS` | auto | Ethereal SMTP password |

## 📁 Project Structure

```
reachinbox/
├── backend/
│   ├── prisma/schema.prisma        # DB schema
│   └── src/
│       ├── config/                 # env, redis, passport
│       ├── controllers/            # auth, email, slack
│       ├── db/                     # Prisma client
│       ├── middleware/             # JWT auth
│       ├── queues/                 # BullMQ queue + worker
│       ├── routes/                 # Express routers
│       ├── search/                 # Elasticsearch
│       ├── services/               # mailer, rateLimiter, slack, csvParser, recovery
│       ├── app.ts                  # Express app factory
│       └── index.ts                # Bootstrap
├── frontend/
│   └── src/
│       ├── components/             # StatusBadge, ComposeModal, Tables, States, SlackWidget
│       ├── hooks/                  # useEmailJobs, useSlack
│       ├── layouts/                # DashboardLayout
│       ├── pages/                  # Login, Dashboard, AuthCallback
│       ├── services/               # api.ts, emailService.ts
│       └── types/                  # TypeScript types
├── docker-compose.yml
├── .env.example
└── README.md
```

## 🔒 Storage Efficiency

- **BullMQ jobs contain only `{ emailJobId }` — no duplicated email content in Redis**
- **PostgreSQL** = permanent source of truth for all email data
- **Redis** = BullMQ queue + rate-limit counters (TTL = 1hr, auto-expire)
- **Elasticsearch** = search index only (minimal fields: jobId, userId, toEmail, subject, status, dates)
- **CSV files** are parsed in memory and immediately discarded (not written to disk)
- BullMQ completed jobs: `removeOnComplete: { count: 100, age: 86400 }`
- BullMQ failed jobs: `removeOnFail: { count: 500, age: 604800 }`

## ⚡ Reliability & Idempotency

- **Deterministic job IDs**: `emailJob.id` is used as the BullMQ job ID — prevents duplicate queuing
- **Status check in worker**: Worker skips jobs already in `SENT` or `FAILED` state
- **Optimistic locking**: `updateMany({ where: { status: 'SCHEDULED' } })` prevents double-processing
- **Restart recovery**: On startup, scans PG for `SCHEDULED`/`PROCESSING` jobs not in Redis and re-queues them
- **PROCESSING reset**: Jobs stuck in `PROCESSING` on restart are reset to `SCHEDULED`

## ⏱️ Rate Limiting

- Redis atomic Lua script: `INCR` + `EXPIRE` in one round-trip
- Key format: `rate-limit:{userId}:{hourWindow}` (auto-expires after 1 hour)
- When limit hit:
  1. Do NOT fail the email permanently
  2. Scan forward up to 24 hours for next available window
  3. Reschedule job to that window
  4. Reset PG status to `SCHEDULED`
  5. Send Slack notification (if connected)

## 📋 Requirement Checklist

- [x] P0: Scheduling, BullMQ, Redis, PostgreSQL, Ethereal, idempotency, restart recovery, rate limiting, frontend dashboard
- [x] P1: Google OAuth, Slack OAuth, Elasticsearch, Bull Board
- [x] P2: UI polish, loading/error/empty states, storage efficiency
- [x] No cron/setInterval/polling-based scheduling — BullMQ delayed jobs only
- [x] All limits from environment variables
- [x] Clean monorepo structure
- [x] TypeScript throughout
