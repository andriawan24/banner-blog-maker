## Context

`app/page.tsx` is a single client component: a `lg:grid-cols-[380px_1fr]` split between a
sticky preview stage and a scrollable controls `<aside>`. Below `lg` it falls back to a flex
column with the stage pinned via `sticky top-0` and a `clamp(150px,38vh,440px)` height — on
real phones this eats most of the viewport before any controls are visible, inputs/segmented
controls are sized for mouse pointers (dense `gap-4` segmented tabs, small toggle rows), and
there's no way to collapse sections, so users scroll a long flat list to reach Export/Account.
Auth pages (`app/(auth)/*`) are already centered cards but padding/type scale don't flex much
across breakpoints. Design tokens (OKLCH palette, motion durations/easings, fonts) already
exist in `app/globals.css` and `design.md` (repo root) — this change reuses them, it does not
introduce a new visual system.

## Goals / Non-Goals

**Goals:**
- Editor usable one-handed on a phone: preview never dominates the fold, controls are
  reachable without excessive scrolling, tap targets meet ~44px minimum.
- Introduce collapsible sections in the controls panel so users can jump to what they need.
- Preserve all existing functionality (variant/theme/content/style/export/account/API preview)
  — this is a layout/interaction revamp, not a feature change.
- Keep the existing Atelier token system (colors, fonts, motion) — extend, don't replace.
- Auth pages get consistent responsive spacing/type scale, no new fields.

**Non-Goals:**
- No new banner variants, export formats, or backend/API changes.
- No design-token/palette overhaul (colors, fonts stay as defined in `globals.css`).
- No state-management rewrite of `app/page.tsx`'s hooks/handlers — only markup/layout/className
  changes and, where needed, small additive UI state (e.g., which section is expanded).

## Decisions

- **Mobile layout order: Preview → collapsed controls, not sticky-stage.** Replace the
  `sticky top-0` clamp-height stage with a normal-flow compact preview (fixed sensible height,
  e.g. `aspect-video`-driven) followed by the full controls stack below `lg`. Rationale: sticky
  eats scroll real estate on small screens for no benefit since users mostly interact with
  controls, not the stage, while editing. Alternative considered: keep sticky but shrink height
  further — rejected, still cramped and complicates section-collapse UX underneath.
- **Collapsible `<details>`-based sections instead of custom accordion state.** Replace the flat
  `Section` divider component with native `<details>/<summary>` (styled to match existing
  `Section` look) for Content / Byline / Style / Export / Configuration / My account / API
  request. Rationale: zero extra JS state, built-in accessibility (keyboard, screen reader),
  matches "no new dependencies" constraint. Alternative: React state + custom accordion —
  rejected as unnecessary complexity for this need.
- **Sticky bottom action bar on mobile for Preview/Download.** On `<lg`, pin the Preview/Download
  buttons to the bottom of the viewport (`fixed bottom-0` within safe-area padding) instead of
  living mid-scroll in the Export section, so the primary actions are always reachable. On
  `lg+`, keep them inline as today. Rationale: these are the most-used actions; burying them in
  a long scroll is the core "bad editing experience" complaint.
  Trade-off: needs `env(safe-area-inset-bottom)` padding and must not overlap content — mitigate
  with bottom padding spacer in the scroll container equal to the bar's height.
- **Segmented controls become wrapping, larger-tap-target rows on mobile.** Increase `Segmented`
  button padding/hit area under `<lg` (`py-2` min, `gap-2` instead of `gap-4`) and allow wrapping
  without breaking the underline-tab visual on desktop (`lg:` variants preserve current compact
  style). Rationale: current `gap-4` tabs with no vertical padding are sub-44px targets.
- **Auth pages: fluid padding/type via clamp + `sm:` steps, no structural change.** Keep the
  centered-card pattern; widen safe margins on very small screens (`px-4` on `<main>` wrapper)
  and let the card padding step from `p-6` → `sm:p-8`. Rationale: layout already sound, only
  needs breakpoint tuning.
- **Reuse existing Tailwind v4 breakpoints (`sm`, `md`, `lg`) — no custom breakpoints added.**
  Rationale: consistency with rest of codebase; avoids config churn.

## Risks / Trade-offs

- [Risk] `<details>` default styling/animation can look abrupt without transition support in
  all browsers → Mitigation: use CSS `@starting-style`-free simple height/opacity via
  `[&::-webkit-details-marker]` icon rotation and content fade; acceptable if the open/close
  itself isn't animated, since scope is layout not motion redesign.
- [Risk] Fixed bottom action bar could overlap iOS Safari's own bottom chrome or on-screen
  keyboard → Mitigation: `env(safe-area-inset-bottom)` padding, and bar only renders `<lg`
  where keyboard-focus fields aren't adjacent to it (fields are above, in scrollable area).
- [Risk] Reordering DOM (preview before controls in source vs. `order-*` utilities today) could
  affect tab order / screen-reader flow → Mitigation: keep using Tailwind `order-*` utilities
  (as already done) rather than physically reordering DOM, preserving existing a11y source order
  (controls first) while visually placing preview first on mobile only if that proves necessary;
  otherwise keep current visual order (preview first) which already matches source order.
- [Risk] Testing deferred to end of implementation (per user instruction) means regressions in
  functionality (save/export/upload) could go unnoticed until late → Mitigation: keep all
  JS logic/handlers untouched, changes scoped to JSX structure/className, run full manual pass
  (`npm run dev` + resize + `npm run lint`) at the end per tasks.md.

## Migration Plan

Purely additive frontend change, no data/schema migration. Deploy as a normal PR; rollback is
a plain revert since no persisted state format changes.

## Open Questions

- None blocking — proceed with decisions above; revisit sticky-bar-vs-inline placement after
  first responsive pass if it feels wrong in practice.
