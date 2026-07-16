## Context

The app is a single-page Next.js 16 studio (`app/page.tsx`) that lets a user configure a blog banner (`components/banner/Banner.tsx`, `lib/banner.ts`), preview it (`components/banner/BannerImage.tsx`), and export it. It already has:
- S3 upload support (`app/api/upload/route.ts`) for image assets used inside a banner.
- A light/dark theme toggle for the *app UI* (`components/ThemeToggle.tsx`), separate from the banner's own rendered theme.
- A banner-generation API (`app/api/banner/route.ts`) restricted to a configured domain.

There is currently no database, no auth, and no persistence — every session starts from a blank config. This design adds accounts + persistence, dual-theme export, and a visual redesign pass.

## Goals / Non-Goals

**Goals:**
- Let a user create an account, sign in, and have their banner configs/results persist across sessions and devices.
- Let a single export action produce both a light-mode and dark-mode rendition of the banner, without re-configuring or re-triggering per mode.
- Redesign the studio UI using the `hallmark` skill for a distinctive, non-generic look.
- Keep the app deployable with a single new required infra dependency (a Postgres database) and document it in `.env.example`.

**Non-Goals:**
- No social/collaborative features (sharing configs between users, teams, orgs).
- No billing/subscription tiers — accounts are free-tier only for now.
- No redesign of the banner's own visual templates (`lib/banner.ts` render logic) beyond what's needed for dual-mode export — this is a studio-chrome redesign, not a banner-template redesign.
- No migration of anonymous/guest usage data — accounts start empty.

## Decisions

**Database: Postgres via Prisma.**
Chosen over a lighter option (SQLite) because the app will eventually run on serverless hosting (Vercel-style) where a networked DB is required; Prisma over Drizzle for broader ecosystem docs and easier onboarding for a single-maintainer project. Alternative considered: Supabase (Postgres + auth bundled) — rejected for now to keep infra choices decoupled and swappable, but the schema is designed to be Supabase-compatible if adopted later.

**Auth: Auth.js (NextAuth) with Credentials + optional OAuth providers, Prisma adapter.**
Chosen because it integrates directly with the Prisma schema for session/account storage and supports adding OAuth (GitHub/Google) later without a rewrite. Alternative considered: rolling custom JWT auth — rejected, more surface area for security bugs for a solo/small-team maintained project.

**Session strategy: database sessions (not JWT-only).**
Enables server-side session revocation and keeps user-scoped queries simple via `session.user.id`. Trade-off: one extra DB read per authenticated request, acceptable at this app's scale.

**Data model (high level):**
- `User` (id, email, hashed password or OAuth-linked, timestamps)
- `Account` / `Session` / `VerificationToken` (standard Auth.js Prisma adapter tables)
- `BannerConfig` (id, userId, name, config JSON, createdAt, updatedAt) — one row per saved config
- `BannerResult` (id, userId, bannerConfigId, s3KeyLight, s3KeyDark, createdAt) — optional saved-export record pointing at S3 objects already uploaded via the existing upload route

**Dual-theme export: render both modes client-side in one action, bundle as a zip.**
On export, the existing `BannerImage` render is invoked twice (light config, dark config) using the current banner config as the source of truth, producing two image blobs. They're bundled into a single `.zip` (via `jszip`, a new dependency) and downloaded as one file, OR offered as two sequential downloads if zip bundling proves awkward with `jspdf`'s existing PDF export path — the exact packaging (zip vs. two files) is left to specs/tasks to finalize per export format (PNG vs PDF differ here).
Alternative considered: server-side dual render — rejected because rendering already happens client-side via canvas/DOM (`BannerImage.tsx`); moving it server-side would duplicate rendering logic for no benefit.

**`.env.example` additions:**
```
DATABASE_URL="postgresql://user:password@localhost:5432/banner_maker"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
```
(AWS S3 vars already exist in the codebase and are left as-is.)

**Redesign scope: apply `hallmark` to existing studio page only.**
Runs as a design pass over current components (`app/page.tsx`, `Banner.tsx`, `ThemeToggle.tsx`) plus any new account UI (sign in/up forms, saved-configs list) so the new surfaces match from day one rather than needing a second pass.

## Risks / Trade-offs

- [Risk] Adding auth introduces a migration/deployment step (running Prisma migrations) that could block deploys if misconfigured → Mitigation: document `DATABASE_URL` setup and `prisma migrate deploy` in README/.env.example; fail loudly at boot if `DATABASE_URL` is missing.
- [Risk] Storing password hashes adds security surface → Mitigation: use Auth.js's built-in credential hashing helpers (bcrypt) rather than hand-rolled hashing; never log raw passwords.
- [Risk] Dual export doubles client-side render/export work, could slow down export on large banners → Mitigation: run the two renders sequentially with a loading state rather than in parallel, keep memory bounded.
- [Risk] Redesign touches the same files being modified for accounts/export, risking merge conflicts if built in parallel → Mitigation: sequence tasks so redesign lands last, after functional pieces are in place.

## Migration Plan

1. Add Prisma + Postgres, define schema, run initial migration locally.
2. Add Auth.js with Credentials provider, wire Prisma adapter, add sign-in/sign-up UI.
3. Add `BannerConfig`/`BannerResult` persistence (save/load) gated behind an authenticated session; anonymous users keep current no-persistence behavior.
4. Implement dual-theme export, replacing the single-mode export action.
5. Apply `hallmark` redesign pass across studio + new account UI.
6. Update `.env.example` and README with new required env vars.

Rollback: each step is additive and independently revertible (new tables/routes/components); no destructive change to existing export or banner-rendering logic until step 4, which should keep the old single-mode export path available behind a flag until dual export is verified.

## Open Questions

- Should saved `BannerResult` exports be stored in S3 (persisted) or generated on-demand each time from `BannerConfig` (cheaper, simpler, no extra S3 storage)? Leaning on-demand — defer final call to tasks.md.
- OAuth providers (GitHub/Google) now or later? Defaulting to email/password (Credentials) only for v1; OAuth is a Non-Goal extension point, not required now.
- Zip bundling vs. two sequential downloads for dual export — finalize based on what's least jarring in the browser download UX.
