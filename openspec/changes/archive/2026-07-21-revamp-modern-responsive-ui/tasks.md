## 1. Shared primitives (controls panel)

- [x] 1.1 Add a `CollapsibleSection` primitive (native `<details>/<summary>`, styled to match
      current `Section` divider look) in `app/page.tsx`, replacing the flat `Section` component
      for: Content, Byline, Style, Export, Configuration, My account, API request.
- [x] 1.2 Widen `Segmented` tap targets below `lg` (padding/gap increase, allow wrap) while
      preserving current compact desktop styling via `lg:` variants.
- [x] 1.3 Widen `Toggle` row min-height and `Input`/`TextArea`/`ImageInput` vertical padding
      below `lg` for touch targets (~44px).

## 2. Editor layout (`app/page.tsx`)

- [x] 2.1 Replace the `sticky top-0` clamp-height preview stage with a normal-flow, viewport-
      appropriate compact preview on `<lg` (e.g. width-bound with `aspect-video`/`aspect-square`
      per variant), keeping current side-by-side sticky behavior at `lg+`.
- [x] 2.2 Wrap Content/Byline/Style/Export/Configuration/My account/API request sections in the
      new `CollapsibleSection`. Implementation note: simplified from the original "collapsed on
      mobile, open on lg+" plan to uncontrolled `<details>` with sensible fixed defaults (all
      open except API request, which starts collapsed) — same behavior at every breakpoint,
      avoiding fragile CSS-only responsive-open logic on native `<details>`.
- [x] 2.3 Add a mobile-only fixed bottom action bar (Preview/Download) with safe-area padding,
      hidden at `lg+` where the inline buttons in the Export section remain as today; add bottom
      spacer so it never overlaps scrollable content.
- [x] 2.4 Verify grid/flex breakpoints for the header (title, AccountBar, ThemeToggle) wrap
      cleanly and don't overflow at narrow widths.

## 3. Auth pages

- [x] 3.1 Tune `app/(auth)/layout.tsx` and `sign-in`/`sign-up` page wrappers for fluid
      horizontal margin on very small viewports (`px-4` safe margin) and `p-6`/`sm:p-8` card
      padding step.
- [x] 3.2 Increase input and submit-button min-height on both auth pages for ~44px touch
      targets, consistent with editor control sizing from Task 1.3.

## 4. Shared chrome

- [x] 4.1 Review `components/ThemeToggle.tsx` for adequate tap target size on mobile.
- [x] 4.2 Add/adjust any responsive utility classes needed in `app/globals.css` to support the
      collapsible sections and mobile action bar (e.g. safe-area padding utility, details
      marker rotation).

## 5. Final verification (run once, at the end)

- [x] 5.1 Run `npm run lint` and fix any issues. Clean, no issues.
- [x] 5.2 Start the dev server and verify the editor compiles/renders (`/`) with no server or
      console errors. Note: no Chromium available in this environment (Playwright browser not
      installed, no local Chrome) so pixel-level resize verification at 375/768/1280px could
      not be done visually — verified instead via clean compile, route 200s, and manual review
      of every changed Tailwind breakpoint class against the spec requirements.
- [x] 5.3 Verify sign-in (`/sign-in`) and sign-up (`/sign-up`) routes compile/render with no
      errors (same visual-check limitation as 5.2 applies).
- [x] 5.4 Reviewed diff for functional regression risk: no handler/state logic touched in
      `app/page.tsx` (variant/theme/export/save/account/API snippet) or auth pages — changes
      are scoped to JSX structure and Tailwind classes only, matching the design.md decision to
      keep all JS logic untouched.
- [x] 5.5 Archive the change with `openspec archive` once verification passes.
