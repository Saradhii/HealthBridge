# HealthBridge

A multi-tenant hospital management system. Each hospital (tenant) manages its own
staff, patients, appointments, wards, prescriptions, lab results, and procedures
under a role-based access control model.

Originally built for HackArena 2.0 at Masaiverse 2.0 (with PlatformCommons), since
refactored for production.
Certificate: https://drive.google.com/file/d/1gJ4kTt_vU34_kbxoBAmhsXYKOWQ6kKwf/view?usp=sharing

## Architecture

- **Frontend** — Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui,
  TanStack Table, React Hook Form, Zustand.
- **Backend** — Hono running on Cloudflare Workers, Drizzle ORM over Neon (Postgres),
  Upstash Redis for login rate limiting, JWT authentication.
- **Authorization** — multi-tenant RBAC. Permissions are `RESOURCE:ACTION` strings
  (e.g. `PATIENT:READ`) with `RESOURCE:*` and `*:*` wildcards. Roles are assigned per
  user and scoped to a tenant.

## Modules

Users and roles, patients, appointments, wards and rooms (with patient stays),
prescriptions, lab results, procedures, and a stats dashboard. Settings cover
profile, appearance, and notification preferences.

## Project layout

```
backend/    Hono API (Cloudflare Workers) + Drizzle schema, migrations, seeds
frontend/   Next.js application
```

## Local development

### Backend

```
cd backend
bun install
cp .dev.vars.example .dev.vars   # then fill in the values below
bun run dev                      # wrangler dev
```

Required variables (in `.dev.vars` for local, as Wrangler secrets in production):

| Variable       | Description                                        |
| -------------- | -------------------------------------------------- |
| `DATABASE_URL` | Neon Postgres connection string                    |
| `REDIS_URL`    | Upstash Redis REST URL/token                       |
| `JWT_SECRET`   | Signing secret, **must be at least 32 characters** |
| `FRONTEND_URL` | Allowed CORS origin (also set in `wrangler.toml`)  |

Database:

```
bun run db:generate   # generate a migration from schema changes
bun run db:migrate    # apply migrations
bun run db:seed       # seed roles, users, and sample data
```

### Frontend

```
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8787" > .env.local
npm run dev
```

## Deployment

- Backend: `cd backend && bun run deploy` (Wrangler). Set secrets with
  `wrangler secret put JWT_SECRET` (and `DATABASE_URL`, `REDIS_URL`); `FRONTEND_URL`
  lives in `wrangler.toml [vars]`.
- Frontend: deploy on any Next.js host; set `NEXT_PUBLIC_API_URL` to the Worker URL.

## Default roles

Seeding creates: Super Admin (`*:*`), Hospital Admin, Doctor, Nurse, Pharmacist, and
Receptionist, each with a sensible default permission set and hierarchy level. Admins
can create custom roles and adjust permissions from the dashboard.
