# Banner Blog Maker

A focused Next.js studio for designing, previewing, and exporting blog/social
media banners. It includes an interactive editor, multiple banner variants,
image upload support, client-side exports, and a server-side image generation
API documented with OpenAPI.

![Banner Blog Maker desktop screenshot](desktop.png)

## Features

- Interactive banner editor with editorial, terminal, spotlight, and square
  layouts.
- Theme, accent, background, metadata, rounded-corner, and typography controls.
- Export to PNG, WebP, JPG, or PDF from a crisp full-resolution artboard.
- Local browser persistence for the latest editor configuration (anonymous,
  no account required).
- User accounts (email/password) with per-account saved banner configs that
  sync across devices.
- Server-side `/api/banner` image generation route powered by `next/og`.
- Multipart `/api/upload` route for adding image assets to S3-compatible storage.
- OpenAPI contract in `openapi.yml` for API clients and documentation tooling.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- `next/og` for server-rendered PNG generation
- `jspdf` for PDF export packaging
- PostgreSQL via Prisma ORM
- Auth.js (NextAuth v5) with the Prisma adapter and a Credentials (email +
  password) provider

## Getting Started

Install dependencies:

```bash
pnpm install
```

Copy the example environment file and fill in real values:

```bash
cp .env.example .env
```

Set up the database (see [Database Setup](#database-setup) below), then run
the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to use the editor. Note
that `middleware.ts` restricts every `/api/*` route (including
`/api/auth/*` and `/api/banner-configs`) to the host configured in
`API_DOMAIN` — set it to `localhost:3000` for local development, or sign-in/
sign-up and the studio's export/upload routes will all 404.

## Useful Commands

```bash
pnpm lint
pnpm build
```

## Database Setup

Accounts and saved banner configs are backed by PostgreSQL via
[Prisma](https://www.prisma.io/) (v7). Schema lives in `prisma/schema.prisma`
(User/Account/Session/VerificationToken for Auth.js, plus `BannerConfig` and
`BannerResult` for per-user persistence). Prisma 7 moved the datasource
connection out of the schema file: `prisma.config.ts` (at the project root)
reads `DATABASE_URL` for the CLI (`migrate`, `generate`, etc.), and
`lib/prisma.ts` passes it to `PrismaClient` at runtime via the
`@prisma/adapter-pg` driver adapter — the schema's `datasource` block only
declares the provider now.

1. Provision a PostgreSQL database (locally via Docker, or a hosted instance).

   ```bash
   docker run -d --name banner-maker-pg \
     -e POSTGRES_USER=user -e POSTGRES_PASSWORD=password -e POSTGRES_DB=banner_maker \
     -p 5432:5432 postgres:16-alpine
   ```

2. Set `DATABASE_URL` in `.env` to point at it, e.g.:

   ```bash
   DATABASE_URL="postgresql://user:password@localhost:5432/banner_maker"
   ```

3. Set `NEXTAUTH_URL` and `NEXTAUTH_SECRET` in `.env` as well (see
   `.env.example` — generate the secret with `openssl rand -base64 32`).

4. Apply migrations:

   - First-time / local dev (creates and applies a new migration if the
     schema changed): `pnpm exec prisma migrate dev`
   - Deploying to an existing environment (applies committed migrations,
     does not generate new ones — use this in CI/production):
     `pnpm exec prisma migrate deploy`

5. (Re)generate the Prisma client after schema changes:

   ```bash
   pnpm exec prisma generate
   ```

The initial migration (`prisma/migrations/20260716074308_init`) was
generated and applied against a local Postgres 16 container during
development and is committed to the repo — running `prisma migrate deploy`
against a fresh database will apply it directly.

## API

Generate a banner image:

```bash
curl -X POST http://localhost:3000/api/banner \
  -H "Content-Type: application/json" \
  -o banner.png \
  -d '{
    "variant": "editorial",
    "theme": "dark",
    "title": "Designing systems that feel almost invisible",
    "subtitle": "Notes on building a personal site.",
    "accent": "#7DD3A1",
    "background": "grid"
  }'
```

See `openapi.yml` for the complete request schema.

## Accounts & Saved Configs

Visitors can use the studio anonymously with no account — configs only
persist to the current browser's `localStorage`, and export works exactly as
before. Creating an account additionally unlocks:

- `POST /api/sign-up` — create an account (`{ email, password }`).
- `/sign-up`, `/sign-in` — account UI. Sign-in is a Credentials (email +
  password) flow via Auth.js; sign-out is available from the studio header.
- `GET /api/banner-configs` — list the signed-in user's own saved configs.
- `POST /api/banner-configs` — save the current studio config
  (`{ name, config }`).
- `PATCH /api/banner-configs/:id` / `DELETE /api/banner-configs/:id` —
  update/delete a config; scoped to the owning user (403/404 for configs
  belonging to someone else).

All of the above live under `/api/*` and are therefore also gated by the
`API_DOMAIN` middleware check described above.

## Image Upload Storage

Uploads are stored in S3-compatible object storage. For Garage, configure these
environment variables in production:

```bash
S3_BUCKET=your-bucket
S3_ENDPOINT=https://s3.example.com
S3_REGION=garage
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_FORCE_PATH_STYLE=true
S3_PUBLIC_BASE_URL=https://s3.example.com/your-bucket
S3_UPLOAD_PREFIX=uploads
```

`S3_PUBLIC_BASE_URL` must be publicly readable because uploaded images are used
by the browser preview and the server-side banner renderer.

## Deploy on Vercel

This project is ready for Vercel. Import the repository, keep the default Next.js
settings, and deploy.

For local production testing:

```bash
pnpm build
pnpm start
```
