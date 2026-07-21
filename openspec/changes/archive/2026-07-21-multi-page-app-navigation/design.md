## Context

The app currently has one route group: `(auth)` for sign-in/sign-up, and `/` for everything
else (editor + account + API preview), all client-rendered in `app/page.tsx`. Auth is
NextAuth v5 (`@/lib/auth`), session available via `useSession()` client-side or `auth()`
server-side. `/api/banner-configs` already supports full CRUD including PATCH for rename.
Design tokens (Atelier palette, fonts, motion) live in `app/globals.css` and are reused as-is.

## Goals / Non-Goals

**Goals:**
- Three real routes: `/` (Home/Edit), `/profile`, `/api-docs`, joined by one shared nav.
- Profile page: editable history — rename inline, delete, load-into-editor navigation back to
  `/`, all using the existing `/api/banner-configs` endpoints (no backend changes).
- API Docs page: creative but accurate reference for the render API, sharing one source of
  truth for the language snippets with wherever else they're shown.
- Nav is consistent, responsive (reuses patterns from the prior responsive-editor-ui change),
  and clearly indicates the active page.

**Non-Goals:**
- No new backend routes/models — `BannerConfig` CRUD already covers "editable history".
  `BannerResult` (export records) is not surfaced in this change; profile shows config history
  only.
- No multi-tenant/team features, no public API-key management UI (the API Docs page documents
  the existing `$BANNER_API_KEY` placeholder pattern already used in the editor's snippets,
  it does not add real key issuance).
- No SSR data prefetching changes — `/profile` fetches configs client-side via the existing
  `/api/banner-configs` GET, same pattern the editor used.

## Decisions

- **Load-into-editor handoff via `sessionStorage`, not URL query params.** When a user clicks
  "Load" on a config in `/profile`, write the config to `sessionStorage` under a one-shot key
  (`banner-studio:handoff`) and `router.push("/")`; the editor reads and clears that key on
  mount (checked before the existing localStorage restore). Rationale: config objects are
  larger/nested (avoid gnarly URL-encoded JSON), and this mirrors the existing localStorage
  restore pattern already in `app/page.tsx` (`useLayoutEffect` + `queueMicrotask`). Alternative
  considered: pass config id via query string and re-fetch on `/` — rejected, adds a network
  round trip and duplicate fetch logic for something already in hand.
- **`AppNav` as one shared client component, imported by `/`, `/profile`, `/api-docs`.**
  Not a route-group layout, because `/` needs the nav embedded inside its existing flex/grid
  shell (it isn't a simple children-wrapping layout — the nav sits inside the controls aside's
  header today) while `/profile` and `/api-docs` can wrap it via a lightweight shared
  `AppShell` layout. Concretely: create `app/(app)/layout.tsx` as a route group covering
  `/profile` and `/api-docs` that renders `<AppNav />` + `{children}`, and mount `<AppNav />`
  directly inside `app/page.tsx`'s header (replacing the current title-only header content)
  so all three pages render the identical nav component. Alternative considered: force `/`
  into the same route group layout — rejected, would require restructuring the existing
  sticky/grid stage-and-aside layout in `app/page.tsx` more invasively than this change's scope.
- **Extract snippet builders to `lib/api-snippets.ts`.** Move `buildSnippet`, `indent`, `pyDict`,
  `API_LANGS`, `ApiLang`, `API_ENDPOINT` out of `app/page.tsx` into a shared module. The API
  Docs page imports the same builder with an example payload; nothing about the render logic
  changes. Rationale: avoids duplicating ~90 lines of per-language snippet formatting.
- **Profile history list reuses the existing `RemoteConfig` shape and `/api/banner-configs`
  calls**, lifted out of `app/page.tsx` into `/profile`'s own component state (the editor no
  longer needs its own copy once the inline "My account" section is removed).
- **Editor's inline "My account" and "API request" collapsible sections are removed**;
  `Configuration` section gets a one-line "Manage saved configs and account in Profile →" link
  instead. Local (`localStorage`) Save/Reset config stays in the editor — that's anonymous-safe
  and distinct from signed-in cloud history.
- **`/profile` gate: redirect unauthenticated visitors to `/sign-in`.** Implemented as a client
  check (`useSession`) redirecting via `useRouter` on mount, consistent with the app's existing
  fully-client-rendered pattern (no middleware/server-component gate introduced, keeping this
  change additive rather than touching auth plumbing).
- **API Docs page is fully static/client content** (no data fetching) — reference text, an
  endpoint description, a parameter table generated from `Tweaks`/export options already defined
  in `lib/banner.ts`, and the language-tabbed snippet preview. Since the editor removes its own
  inline API preview, the `ApiPreview` component moves wholesale from `app/page.tsx` into
  `components/ApiPreview.tsx` and is imported only by the new API Docs page.

## Risks / Trade-offs

- [Risk] Removing the editor's inline API preview/account sections is a **BREAKING** UX change
  for anyone relying on the old single-page layout → Mitigation: proposal explicitly calls this
  out; nav makes the new locations one click away; functionality is preserved, just relocated.
- [Risk] `sessionStorage` handoff key could be stale if a user opens `/` in another tab before
  the handoff completes → Mitigation: key is read-and-cleared immediately on `/` mount, and this
  is a single-user, single-session flow (no multi-tab collaboration expectation existed before).
- [Risk] Client-side auth redirect on `/profile` causes a brief flash before redirecting
  unauthenticated users → Mitigation: render nothing (or a minimal loading state) until
  `useSession()` resolves, matching the existing `status === "loading"` pattern from
  `AccountBar`.
- [Risk] Duplicating nav-active-link logic across pages → Mitigation: `AppNav` takes no props,
  derives active route from `usePathname()` internally, single implementation.

## Migration Plan

Additive/relocational frontend change, no data migration. Deploy as a normal PR. Rollback is a
plain revert; no persisted data format changes (config history already lives in `BannerConfig`,
untouched).

## Open Questions

- None blocking.
