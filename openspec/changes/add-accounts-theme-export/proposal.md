## Why

App currently loses all config on refresh — no way to save banner configs or results across sessions/devices. Exporting also forces a choice between light and dark mode per download, requiring users to redo the export twice if they want both. Visual design also needs a refinement pass to shed generic AI-tool look.

## What Changes

- Add user accounts (sign up/sign in/sign out, session management) backed by a database.
- Add persistence for banner configs and saved results, scoped per-user.
- Add DB config to `.env.example` (connection string + any auth secrets needed).
- **BREAKING**: export flow changes from single-mode download to dual download — one click produces both a light-mode and a dark-mode asset (e.g. as a zip or two sequential downloads), removing the need to toggle theme and re-export.
- Redesign the app's visual language (layout, typography, color, component polish) using the `hallmark` skill, applied across the existing banner studio page.

## Capabilities

### New Capabilities
- `user-accounts`: account creation, authentication, session handling, and per-user persistence of banner configs and results, backed by a database.
- `dual-theme-export`: exporting a banner produces both light and dark mode outputs in one action instead of one mode at a time.

### Modified Capabilities
(none — no existing specs to modify; this is the first proposal for this project)

## Impact

- Affected code: `app/page.tsx`, `components/banner/Banner.tsx`, `components/banner/BannerImage.tsx`, `components/ThemeToggle.tsx`, `lib/banner.ts`, `app/api/banner/route.ts`, `app/api/upload/route.ts`.
- New: database schema/migrations, auth/session layer, new API routes for account + saved-config CRUD, `.env.example` entries for DB connection and auth secrets.
- Dependencies: adds a database client/ORM and an auth library (to be decided in design.md).
- No existing specs are modified since this is the project's first OpenSpec change.
