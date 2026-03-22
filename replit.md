# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Smallbiz Marketing Portal — centralized hub for managing video content marketing operations.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite, Tailwind CSS, Recharts, Framer Motion, date-fns, lucide-react

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (videos, shoots, approvals, analytics)
│   └── marketing-portal/   # React frontend (green/black Smallbiz branding)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/
└── package.json
```

## Artifacts

### `artifacts/marketing-portal` — Smallbiz Marketing Portal (React + Vite)
- Preview at `/` (root)
- Pages: Dashboard, Calendar, Videos, Shoots, Approvals
- Green (#22c55e) + black brand theme
- Includes folder link (Dropbox/Drive) per video for asset sharing

### `artifacts/api-server` — API Server (Express 5)
- Routes: `/api/videos`, `/api/shoots`, `/api/approvals`, `/api/analytics`
- DB: PostgreSQL via Drizzle ORM

## Database Tables

- `videos` — video content with status, platform, folder link, analytics metrics
- `shoots` — shoot scheduling with date, location, linked video
- `approvals` — review/approval workflow with status and comments

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json`. Run `pnpm run typecheck` from root.

## Root Scripts

- `pnpm run build` — typecheck + build all packages
- `pnpm run typecheck` — full typecheck with project references

## Key Commands

- `pnpm --filter @workspace/api-spec run codegen` — regenerate API client + Zod schemas
- `pnpm --filter @workspace/db run push` — push schema changes to DB
- `pnpm --filter @workspace/api-server run dev` — run API in dev mode
- `pnpm --filter @workspace/marketing-portal run dev` — run frontend in dev mode
