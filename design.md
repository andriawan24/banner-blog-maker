# Design — Banner Generator

A locked design system for this app. Every page redesign reads this file before
emitting code. Do not regenerate per page — extend or amend this file when the
system needs to grow.

This system is **preserved from the existing codebase** (`app/globals.css`,
`app/layout.tsx`), not invented fresh — it's already a deliberate, non-generic
warm-editorial studio look. Hallmark's job here is to extend it consistently
to the new account surfaces, not replace it.

## Genre
editorial (warm, tool-like, restrained — closer to a craft studio than a SaaS marketing site)

## Macrostructure family
- App/studio page (`app/page.tsx`): Workbench — control panel + live artboard, dense functional layout.
- Auth pages (`app/(auth)/sign-in`, `app/(auth)/sign-up`): centered single-card form, minimal chrome — the felt canvas showing through around a raised panel card, consistent with the studio's own panel language (not a generic split-screen marketing template).
- Account surfaces (`AccountBar`, saved-configs list/picker): inline chrome within the Workbench, not a separate page.

## Theme
Warm near-black "felt" canvas, neutrals tinted ~70° hue, one warm-amber accent. OKLCH throughout. Dual mode via `data-theme` on `<html>` (dark default, light alternate) — **this is the app-chrome theme**, distinct from the banner's own light/dark export theme.

- `--felt` — canvas: dark `oklch(0.165 0.008 70)` / light `oklch(0.985 0.004 70)`
- `--panel` — controls surface: dark `oklch(0.205 0.009 70)` / light `oklch(0.97 0.005 70)`
- `--raised` — inputs/pressed: dark `oklch(0.255 0.011 70)` / light `oklch(0.99 0.003 70)`
- `--line` / `--line-soft` — hairline borders, dark `oklch(0.32 0.01 70 / .55|.3)` / light `oklch(0.3 0.01 70 / .5|.22)`
- `--fg` / `--fg-muted` / `--fg-faint` — bone/ink text, three steps
- `--accent` — warm amber, dark `oklch(0.81 0.125 70)` / light `oklch(0.62 0.16 60)`
- `--accent-ink` — text on accent

All defined in `app/globals.css` as CSS custom properties, re-exported via `@theme inline` for Tailwind v4 utility classes (`bg-felt`, `bg-panel`, `bg-raised`, `border-line`, `text-fg`, `text-fg-muted`, `text-fg-faint`, `bg-accent`, `text-accent-ink`). **Use these utility classes — never introduce new raw OKLCH values or a second palette.**

## Typography
- Display: Bricolage Grotesque (`--font-display`), used for headings/titles via `font-display` class.
- UI/body: Hanken Grotesk (`--font-ui`), the default body font.
- Mono: Geist Mono (`--font-geist-mono`) — reserved for banner-internal rendering, not app chrome.
- No italic headers. Weight/color carries emphasis.

## Spacing
Tailwind v4 default spacing scale (no custom `--space-*` scale defined yet) — stay on Tailwind's built-in 4px-based scale (`gap-2`, `p-6`, etc.) for consistency with existing code rather than introducing a parallel named scale.

## Motion
- One orchestrated page-load reveal: `.rise` keyframe (fade + 8px translateY, `cubic-bezier(0.22, 1, 0.36, 1)`, 0.5s), respects `prefers-reduced-motion`.
- Interactive elements: `transition` on hover/focus only (border/color/brightness), no spatial motion on hover.
- Focus rings: `focus:ring-2 focus:ring-accent/20` + `focus:border-accent/70` on inputs — instant, no animated appearance.

## Microinteractions stance
- Silent, restrained. No celebratory toasts.
- Inline error text (`text-red-400`, 12px) under forms, not modal/toast.
- Busy states via disabled + label swap ("Signing in…", "Creating…", "Exporting…") rather than spinners.

## CTA voice
- Primary: filled `bg-accent text-accent-ink`, `rounded-lg`, `font-semibold`, `hover:brightness-105`, `disabled:opacity-50`.
- Secondary/tertiary: bordered `border-line bg-raised text-fg-muted`, `rounded-md`, `hover:border-fg-faint hover:text-fg`.
- Text links: `text-fg-muted hover:text-fg`, underline for inline links.

## Per-page allowances
- Studio (app) page: function-first, no decorative enrichment.
- Auth pages: typography + panel-card only, no imagery/illustration — keep the felt canvas as the only "art".
- Account bar / saved-configs list: inline chrome, must read at the same visual weight as existing studio controls (not a bolted-on widget).

## What pages MUST share
- The felt/panel/raised/line/accent token set (both modes).
- Bricolage Grotesque for headings, Hanken Grotesk for body/UI.
- The CTA voice (button shapes, radii, hover states) above.
- The 8-state discipline (default/hover/focus/active/disabled/loading/error/success) on every interactive control.

## What pages MAY differ on
- Layout density: Workbench (studio) is dense/functional; auth pages are sparse/centered.
- Card vs. inline chrome depending on whether the surface is a standalone page or embedded in the studio.

## Exports

Not generating additional export formats (Tailwind `@theme`, DTCG, shadcn) for this pass — the project already has a working Tailwind v4 `@theme inline` block in `app/globals.css` that serves this purpose. Revisit if the system needs to travel to another project.
