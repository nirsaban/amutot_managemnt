# Nachalat David – Production Monorepo Foundation

Stack:
- Next.js (App Router) + TypeScript + Tailwind (`apps/web`)
- NestJS + TypeScript (`apps/api`)
- Prisma + PostgreSQL
- pnpm workspaces
- Docker Compose

## Prerequisites
- Node.js 20+ (recommended)
- pnpm 9+
- Docker

## Setup
```bash
pnpm install
```

## Environment
Copy examples to real env files:
```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

## Database (PostgreSQL)
```bash
docker compose up -d db
```
Database is exposed on `localhost:5433` by default.

## Prisma (optional for now)
```bash
pnpm --filter @nachalat/api prisma:migrate:dev
```

## Dev
Runs web + api in parallel:
```bash
pnpm dev
```

- Web: http://localhost:3000
- API: http://localhost:3001
- API health: http://localhost:3001/health

## Quality
```bash
pnpm lint
pnpm typecheck
pnpm build
```
