## Why

Banner Studio is currently a single page (`/`) that crams the editor, account/config
management, and API integration docs into one long scrolling sidebar. There is no dedicated
place to manage saved configs (rename/delete outside the cramped sidebar list), no account
overview, and no standalone API reference — the API snippet lives buried in a collapsible
section of the editor. Splitting these concerns into real pages with shared navigation makes
the app feel like a proper product and makes each surface (editing, account history, API
integration) easier to use and to find.

## What Changes

- Add a persistent top navigation bar (shown on all authenticated-app pages, not on the auth
  screens) linking **Home/Edit**, **Profile**, and **API Docs**, plus theme toggle and account
  chrome.
- Keep `/` as the **Home / Edit** page (the existing banner editor), reachable as "Home" in nav.
- Add a new **Profile** page (`/profile`) with: account overview (email, sign-out), and a full
  management view of saved banner configs — the config **history** — supporting rename (inline
  edit), load-into-editor, and delete. This replaces/extends the cramped "My account" section
  currently embedded in the editor sidebar with a dedicated, more spacious surface. **BREAKING**:
  the editor's inline "My account" section is removed in favor of a "Manage in Profile →" link.
- Add a new **API Docs** page (`/api-docs`) presenting the banner render API reference: endpoint,
  parameters, and copyable request snippets in multiple languages (extracted from the editor's
  existing snippet generator so both surfaces share one implementation).
- Extract the multi-language snippet-building logic out of `app/page.tsx` into a shared module
  so the editor's (now-removed inline) API preview and the new API Docs page do not duplicate it.
- `/profile` is only meaningful for signed-in users; unauthenticated visitors are redirected to
  `/sign-in` when visiting it.

## Capabilities

### New Capabilities
- `app-navigation`: shared top navigation between Home/Edit, Profile, and API Docs pages.
- `profile-page`: account overview and editable banner-config history management.
- `api-docs-page`: standalone API reference/documentation page for the banner render API.

### Modified Capabilities
(none — `responsive-editor-ui` and `responsive-auth-ui` requirements from the prior change are
unaffected in substance; the editor loses its inline account section but retains all rendering/
export/save-locally functionality covered by those specs.)

## Impact

- Affected/new files: `app/page.tsx` (remove inline "My account" + API preview sections, add
  nav), `app/profile/page.tsx` (new), `app/api-docs/page.tsx` (new), `components/AppNav.tsx`
  (new), `lib/api-snippets.ts` (new, extracted from `app/page.tsx`), `app/(auth)/layout.tsx`
  (unaffected — auth pages keep their own minimal header).
- No new dependencies. Reuses existing `/api/banner-configs` (GET/POST/PATCH/DELETE, PATCH
  already supports rename) and `auth()` session helper — no backend changes required.
- No database schema changes.
