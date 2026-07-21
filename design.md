# Design — Banner Generator

A locked design system for this app. Every page redesign reads this file before
emitting code. Do not regenerate per page — extend or amend this file when the
system needs to grow.

**v2 — full redesign (2026-07-16).** The prior warm-amber "felt" system read as
templated despite being hand-tuned; this pass replaces the palette and type
pairing wholesale (a fresh identity, not a per-page drift) while keeping the
Workbench structure, which already fit the product.

## Genre
editorial (warm, tool-like, restrained — closer to a craft studio than a SaaS marketing site)

## Macrostructure family
- App/studio page (`app/page.tsx`): Workbench — control panel + live artboard, dense functional layout.
- Auth pages (`app/(auth)/sign-in`, `app/(auth)/sign-up`): centered single-card form, minimal chrome — the felt canvas showing through around a raised panel card.
- Account surfaces (`AccountBar`, saved-configs list/picker): inline chrome within the Workbench, not a separate page.

## Theme — "Atelier"
Near-black "felt" canvas tinted moss/sage (~150° hue), one clay-terracotta accent (~40° hue) for deliberate contrast against the neutrals rather than a same-hue amber-on-amber scheme. OKLCH throughout. Dual mode via `data-theme` on `<html>` (dark default, light alternate) — this is the app-chrome theme, distinct from the banner's own light/dark export theme.

- `--felt` — canvas: dark `oklch(0.15 0.012 150)` / light `oklch(0.975 0.006 150)`
- `--panel` — controls surface: dark `oklch(0.19 0.013 150)` / light `oklch(0.95 0.008 150)`
- `--raised` — inputs/pressed: dark `oklch(0.24 0.015 150)` / light `oklch(0.99 0.004 150)`
- `--line` / `--line-soft` — hairline borders, dark `oklch(0.4 0.014 150 / .4|.22)` / light `oklch(0.4 0.016 150 / .4|.2)`
- `--fg` / `--fg-muted` / `--fg-faint` — parchment/ink text, three steps
- `--accent` — clay terracotta, dark `oklch(0.7 0.15 40)` / light `oklch(0.56 0.16 38)`
- `--accent-ink` — text on accent

All defined in `app/globals.css` as CSS custom properties, re-exported via `@theme inline` for Tailwind v4 utility classes (`bg-felt`, `bg-panel`, `bg-raised`, `border-line`, `text-fg`, `text-fg-muted`, `text-fg-faint`, `bg-accent`, `text-accent-ink`). **Use these utility classes — never introduce new raw OKLCH values or a second palette.**

## Typography
- Display: Fraunces, variable serif with optical-size/soft/wonk axes (`--font-display`), used for headings/titles via `font-display` class.
- UI/body: IBM Plex Sans (`--font-ui`), the default body font.
- Mono: JetBrains Mono (`--font-mono` → `--font-jetbrains-mono`) — the app-chrome outlier, used only for the API-request snippet and the artboard size readout (two slots, per the 2+1 rule).
- Geist / Geist Mono (`--font-geist-sans` / `--font-geist-mono`) remain reserved for banner-internal rendering only (`components/banner/Banner.tsx`) — never referenced by app chrome.
- No italic headers. Weight/color carries emphasis.

## Spacing
Tailwind v4 default spacing scale (no custom `--space-*` scale) — stay on Tailwind's built-in 4px-based scale (`gap-2`, `p-6`, etc.).

## Motion
- Named tokens in `app/globals.css`: `--ease-out` / `--ease-in` / `--ease-in-out`, `--duration-micro` (120ms) / `--duration-short` (220ms) / `--duration-long` (420ms) — re-exported via `@theme inline` so Tailwind's `ease-out`, `duration-micro` etc. utilities resolve to them.
- One orchestrated page-load reveal: `.rise` keyframe (fade + 8px translateY, `--ease-out`, `--duration-long`), respects `prefers-reduced-motion`.
- Primary CTAs (Preview, Download, Sign in, Create account) lift `-translate-y-px` on hover and settle on `:active`, using `duration-micro`/`ease-out` — replaces the flat `hover:brightness` with no spatial feedback.
- Secondary/tertiary controls: `transition` on hover/focus only (border/color/brightness), no spatial motion.
- Focus rings: `focus:ring-2 focus:ring-accent/20` + `focus:border-accent/70` on inputs — instant, no animated appearance.
- Shadows use a hairline token (`shadow-[0_0_0_1px_var(--line-soft)]`), never raw `rgba(0,0,0,…)` — avoids the accidental glow that raw black shadows create on a dark surface.

## Microinteractions stance
- Silent, restrained. No celebratory toasts.
- Inline error text (`text-red-400`, 12px) under forms, not modal/toast.
- Busy states via disabled + label swap ("Signing in…", "Creating…", "Exporting…") rather than spinners.

## CTA voice
- Primary: filled `bg-accent text-accent-ink`, `rounded-lg`, `font-semibold`, `hover:brightness-105` + hover lift, `disabled:opacity-50`.
- Secondary/tertiary: bordered `border-line bg-raised text-fg-muted`, `rounded-md`, `hover:border-fg-faint hover:text-fg`.
- Text links: `text-fg-muted hover:text-fg`, underline for inline links.
- Variant/theme pickers use an underline-tab indicator (`border-b-2 border-accent` on the active option), not a filled-pill segmented control — the pill is the generic default; the tab reads as considered.

## Per-page allowances
- Studio (app) page: function-first, no decorative enrichment.
- Auth pages: typography + panel-card only, no imagery/illustration — keep the felt canvas as the only "art".
- Account bar / saved-configs list: inline chrome, must read at the same visual weight as existing studio controls (not a bolted-on widget).

## What pages MUST share
- The felt/panel/raised/line/accent token set (both modes).
- Fraunces for headings, IBM Plex Sans for body/UI, JetBrains Mono for the two outlier slots.
- The CTA voice (button shapes, radii, hover states) above.
- The 8-state discipline (default/hover/focus/active/disabled/loading/error/success) on every interactive control.

## What pages MAY differ on
- Layout density: Workbench (studio) is dense/functional; auth pages are sparse/centered.
- Card vs. inline chrome depending on whether the surface is a standalone page or embedded in the studio.

## Exports

Not generating additional export formats (Tailwind `@theme`, DTCG, shadcn) for this pass — the project already has a working Tailwind v4 `@theme inline` block in `app/globals.css` that serves this purpose. Revisit if the system needs to travel to another project.
