## Why

Banner Studio's editor (`app/page.tsx`) and auth pages work on desktop but break down on
smaller viewports — the preview stage/control-panel split, control density, and touch-target
sizing were never tuned below `lg`. Editing itself is also clunky: the controls panel is a
single long scroll of ungrouped fields, there is no live feedback beyond the raw artboard
readout, and mobile users get a cramped, low-contrast experience. The app needs a modern,
fully responsive UI pass so it is usable and pleasant from phone to desktop.

## What Changes

- Rework the editor layout (`app/page.tsx`) to be responsive across breakpoints: proper
  stacking/collapsing behavior on mobile and tablet, touch-friendly control sizing, and a
  preview stage that scales cleanly instead of being squeezed.
- Modernize the editing experience: clearer section grouping/collapsing in the controls
  panel, improved segmented controls/toggles/inputs for touch, sticky/accessible action bar
  for Preview/Download on small screens.
- Modernize auth pages (`app/(auth)/sign-in`, `app/(auth)/sign-up`, `app/(auth)/layout.tsx`)
  for responsive centering, spacing, and touch-friendly form controls.
- Refresh shared chrome: `app/layout.tsx`, `components/ThemeToggle.tsx`, and `app/globals.css`
  utility/animation classes to support the new responsive patterns consistently.
- No backend, data model, or API route changes.

## Capabilities

### New Capabilities
- `responsive-editor-ui`: Responsive, touch-friendly layout and interaction behavior for the
  banner editor screen (preview stage + controls panel) across mobile/tablet/desktop.
- `responsive-auth-ui`: Responsive, modern layout for sign-in/sign-up pages across breakpoints.

### Modified Capabilities
(none — no existing specs)

## Impact

- Affected files: `app/page.tsx`, `app/(auth)/sign-in/page.tsx`, `app/(auth)/sign-up/page.tsx`,
  `app/(auth)/layout.tsx`, `app/layout.tsx`, `components/ThemeToggle.tsx`, `app/globals.css`.
- No API, schema, or dependency changes. Purely frontend markup/styling/interaction changes
  using existing Tailwind v4 + design tokens already defined in `globals.css`.
