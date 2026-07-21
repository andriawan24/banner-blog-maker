## ADDED Requirements

### Requirement: Responsive editor layout
The banner editor page SHALL present a usable, non-cramped layout at mobile (< 640px), tablet
(640–1023px), and desktop (>= 1024px) viewport widths without horizontal scrolling or
overlapping elements.

#### Scenario: Mobile viewport layout
- **WHEN** the editor is viewed at a viewport width below 640px
- **THEN** the preview stage and controls panel stack vertically, no element overflows the
  viewport width, and the user can reach every control section by scrolling vertically only

#### Scenario: Desktop viewport layout
- **WHEN** the editor is viewed at a viewport width of 1024px or greater
- **THEN** the preview stage and controls panel are shown side by side as today, with the
  controls panel independently scrollable

### Requirement: Touch-friendly controls
All interactive controls in the editor (segmented options, toggles, buttons, color swatches) SHALL have a minimum hit target of approximately 44x44 CSS pixels on viewports below 1024px.

#### Scenario: Segmented control tap target on mobile
- **WHEN** a segmented control (e.g. Variant, Theme, Format) is rendered on a viewport below
  1024px
- **THEN** each option has vertical padding and spacing sufficient to reach an approximate
  44px minimum touch target height

### Requirement: Collapsible control sections
The controls panel SHALL group related fields (Content, Byline, Style, Export, Configuration,
My account, API request) into independently collapsible sections so a user can navigate
directly to a section without scrolling through unrelated fields.

#### Scenario: Collapsing a section
- **WHEN** a user collapses a control section
- **THEN** that section's fields are hidden and the remaining sections shift up, without
  losing any entered field values

#### Scenario: Expanding a section
- **WHEN** a user expands a previously collapsed section
- **THEN** that section's fields are shown again with their current values intact

### Requirement: Reachable primary actions on mobile
On viewports below 1024px, the Preview and Download actions SHALL remain reachable without
requiring the user to scroll through the entire controls panel to find them.

#### Scenario: Primary actions visible while scrolling controls
- **WHEN** a user is scrolled anywhere within the controls panel on a viewport below 1024px
- **THEN** the Preview and Download actions remain visible and operable without additional
  scrolling

### Requirement: No functional regression
The responsive layout changes SHALL preserve all existing editor functionality: variant
selection, theme selection, content/byline/style fields, image upload, export (png/webp/jpg/pdf
as light+dark zip), save/reset local config, cloud account save/load/delete, and the API request
snippet preview.

#### Scenario: Export still produces a zip
- **WHEN** a user clicks Download on any viewport size
- **THEN** a zip file containing light and dark renditions in the selected format is produced,
  identical in behavior to the pre-change implementation
