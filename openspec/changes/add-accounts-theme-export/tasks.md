## 1. Database setup

- [ ] 1.1 Add Prisma + `pg` client to dependencies
- [ ] 1.2 Define Prisma schema: `User`, `Account`, `Session`, `VerificationToken` (Auth.js adapter tables), `BannerConfig`, `BannerResult`
- [ ] 1.3 Add `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET` to `.env.example`
- [ ] 1.4 Run initial Prisma migration and verify schema applies cleanly to a local Postgres instance
- [ ] 1.5 Document DB setup steps in README

## 2. Authentication

- [ ] 2.1 Add Auth.js (NextAuth) with Prisma adapter and Credentials provider
- [ ] 2.2 Implement password hashing on sign-up (bcrypt) and verification on sign-in
- [ ] 2.3 Add sign-up UI (email/password form) with duplicate-email and validation error handling
- [ ] 2.4 Add sign-in UI (email/password form) with generic invalid-credentials error
- [ ] 2.5 Add sign-out action/button
- [ ] 2.6 Add session-aware layout state (show account UI vs. anonymous UI in `app/page.tsx`)

## 3. Per-user config persistence

- [ ] 3.1 Add API routes for `BannerConfig`: create, list (own configs only), update, delete
- [ ] 3.2 Enforce ownership checks so users cannot read/update/delete configs belonging to another user
- [ ] 3.3 Add "Save config" UI action in the studio, authenticated-only
- [ ] 3.4 Add "My saved configs" list/picker UI to load a saved config back into the studio
- [ ] 3.5 Verify anonymous (unauthenticated) flow is unaffected: no save prompts, no persistence, export still works

## 4. Dual-theme export

- [ ] 4.1 Add `jszip` (or equivalent) dependency for bundling multiple export outputs
- [ ] 4.2 Refactor export flow in `components/banner/BannerImage.tsx` / `lib/banner.ts` to render both light and dark mode from the current config
- [ ] 4.3 Bundle both outputs into a single download with mode-indicating file names (e.g. `banner-light.png`, `banner-dark.png`)
- [ ] 4.4 Remove the pre-export theme-mode selection step from the export UI
- [ ] 4.5 Add a loading state covering the full dual-render + bundle duration
- [ ] 4.6 Verify exported content (text/images/layout) is identical between modes aside from theme styling

## 5. Visual redesign

- [ ] 5.1 Run the `hallmark` skill against the studio page (`app/page.tsx`, `components/banner/Banner.tsx`, `components/ThemeToggle.tsx`)
- [ ] 5.2 Apply redesign to new account UI (sign-in/sign-up forms, saved-configs list) so new and existing surfaces match
- [ ] 5.3 Verify redesign holds up in both light and dark app-UI themes (distinct from banner export dual-mode)

## 6. Verification

- [ ] 6.1 Manually verify sign-up → save config → sign-out → sign-in → config still present
- [ ] 6.2 Manually verify dual export downloads both light and dark outputs correctly
- [ ] 6.3 Manually verify anonymous usage path still works end-to-end with no persistence
- [ ] 6.4 Run `openspec validate add-accounts-theme-export --strict` and fix any issues
