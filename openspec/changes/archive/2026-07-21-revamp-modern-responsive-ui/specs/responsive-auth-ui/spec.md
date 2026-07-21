## ADDED Requirements

### Requirement: Responsive auth pages
The sign-in and sign-up pages SHALL render a centered, legible form card at mobile, tablet,
and desktop viewport widths without horizontal scrolling, overflow, or content touching the
viewport edges.

#### Scenario: Small viewport auth rendering
- **WHEN** the sign-in or sign-up page is viewed at a viewport width below 400px
- **THEN** the form card retains horizontal margin from the viewport edges and all text and
  inputs remain fully visible without horizontal scrolling

#### Scenario: Wide viewport auth rendering
- **WHEN** the sign-in or sign-up page is viewed at a viewport width of 1024px or greater
- **THEN** the form card is centered in the viewport with the same maximum width and styling
  as today

### Requirement: Touch-friendly auth form controls
Email/password inputs and the submit button on sign-in/sign-up SHALL have a minimum tap target
height of approximately 44 CSS pixels.

#### Scenario: Submit button tap target
- **WHEN** the sign-in or sign-up submit button is rendered on any viewport
- **THEN** its rendered height is at least approximately 44 CSS pixels

### Requirement: No functional regression
The responsive layout changes to auth pages SHALL preserve existing authentication behavior:
credential sign-in, sign-up, inline validation error display, and navigation links between
sign-in and sign-up.

#### Scenario: Sign-in still authenticates
- **WHEN** a user submits valid credentials on the sign-in page after the layout change
- **THEN** the user is authenticated and redirected as before the change
