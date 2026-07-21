## 1. Shared extraction

- [x] 1.1 Create `lib/api-snippets.ts`: move `API_LANGS`, `ApiLang`, `API_ENDPOINT`,
      `buildSnippet`, `indent`, `pyDict` out of `app/page.tsx` into this module, exported.
- [x] 1.2 Create `components/ApiPreview.tsx`: move the `ApiPreview` component out of
      `app/page.tsx`, importing snippet builders from `lib/api-snippets.ts`.
- [x] 1.3 Lifted `Segmented` into `components/Segmented.tsx` (shared by the editor, `ApiPreview`,
      and the API Docs page); `app/page.tsx` imports it instead of defining it locally. Also
      lifted `VARIANTS`/`THEMES`/`FORMATS`/`SavedBannerConfig`/`RemoteBannerConfig` into
      `lib/banner.ts` so the editor and Profile page share one config shape.

## 2. Navigation

- [x] 2.1 Create `components/AppNav.tsx`: client component with links to `/` (Home/Edit),
      `/profile`, `/api-docs`, using `usePathname()` for active-link styling, plus `ThemeToggle`
      and `AccountBar`. Responsive: flex-wrap, ~44px tap targets on nav links.
- [x] 2.2 Create route group layout `app/(app)/layout.tsx` rendering `<AppNav />` followed by
      `{children}`, applied to `/profile` and `/api-docs`.
- [x] 2.3 Created `/profile` and `/api-docs` pages in the `(app)` route group
      (`app/(app)/profile/page.tsx`, `app/(app)/api-docs/page.tsx`).
- [x] 2.4 `app/page.tsx` now renders `<AppNav />` above its grid (in a shared flex-col wrapper),
      replacing the old title-only header; the aside's own header shrank to a one-line subtitle
      since branding/nav lives in `AppNav`. Preview stage's sticky offset and the aside's height
      were adjusted (`lg:top-16` / `lg:h-[calc(100vh-4rem)]`) to sit correctly below the 64px nav.

## 3. Editor page cleanup (`app/page.tsx`)

- [x] 3.1 Removed the inline "My account" `CollapsibleSection` (cloud save/list/delete UI) and
      all its state/handlers (`remoteConfigs`, `isAuthed`, `saveToAccount`, `loadRemoteConfig`,
      `deleteRemoteConfig`, `configName`, `cloudBusy`, `cloudError`, `useSession` import);
      replaced with a "Manage saved configs and account in Profile →" link in the Configuration
      section.
- [x] 3.2 Removed the inline "API request" `CollapsibleSection` (now lives on `/api-docs`),
      along with the local `apiLang`/`apiSnippet` state (the render-payload `apiPayload` memo is
      kept — it's still used by `onPreview`/`onDownload`).
- [x] 3.3 Reads config handoff from `sessionStorage["banner-studio:handoff"]` on mount, in the
      same effect as (and taking priority over) the existing localStorage restore; clears the
      key immediately after reading via a shared `applyConfig` helper.

## 4. Profile page (`app/(app)/profile/page.tsx`)

- [x] 4.1 Client-side auth gate: redirects to `/sign-in` when `useSession()` resolves
      unauthenticated; renders a minimal "Loading…" state while status is "loading" or before
      the redirect fires.
- [x] 4.2 Account overview section: avatar-initial, signed-in email, and `<SignOutButton />`.
- [x] 4.3 Fetches and renders the user's saved banner configs from `/api/banner-configs` (GET).
- [x] 4.4 Per-config row: inline rename (PATCH, Enter/Escape keyboard support), delete (DELETE),
      and "Load" button that writes the config to `sessionStorage` and navigates to `/`.
- [x] 4.5 Empty state with a `Link` to `/` when the user has no saved configs.

## 5. API Docs page (`app/(app)/api-docs/page.tsx`)

- [x] 5.1 Endpoint overview in the hero section (method badge + `API_ENDPOINT`) plus a dedicated
      Authentication section.
- [x] 5.2 Parameter reference tables (Content/Byline/Style/Output) generated from `Tweaks`
      fields and export options, each with name, type, and description.
- [x] 5.3 Renders `<ApiPreview />` with an example payload built from `DEFAULT_TWEAKS` plus
      sample variant/format/size, with working language tabs.
- [x] 5.4 Creative hero treatment (accent glow, POST badge, editorial heading) distinct from a
      bare table dump, staying within the existing Atelier tokens.

## 6. Final verification (run once, at the end)

- [x] 6.1 `npm run lint` (project + targeted `npx eslint app components lib`) — clean, no
      issues. `npx tsc --noEmit` — no type errors.
- [x] 6.2 Verified all five routes (`/`, `/profile`, `/api-docs`, `/sign-in`, `/sign-up`) compile
      under `next dev` and respond 200, with no server-log errors.
- [ ] 6.3 Manual visual verification of nav active-state and responsive nav at mobile/tablet/
      desktop widths — **not performed**: no Chromium available in this environment (no local
      Chrome install, `npx playwright install` has no network/registry access here). Covered
      instead by code review of every breakpoint class against the app-navigation spec.
- [ ] 6.4 Manual verification of profile flows (rename/delete/load-into-editor, empty state) —
      **not performed** for the same reason; `/api/banner-configs` itself is also gated by
      `middleware.ts`'s `API_DOMAIN` host check in this environment, which is pre-existing and
      unrelated to this change, so a real end-to-end run needs a deployed/matching host anyway.
- [ ] 6.5 Manual verification of API Docs snippet language switching/copy — **not performed**,
      same browser limitation; snippet logic itself is unit-identical to the previously-shipped
      editor version (moved, not rewritten), reducing regression risk.
- [x] 6.6 Confirmed the editor's core logic (state, handlers, `buildBlob`/`onDownload`/
      `onPreview`) is untouched — only JSX for the removed sections and the header changed.
- [x] 6.7 Archive the change with `openspec archive` once this file is saved.
