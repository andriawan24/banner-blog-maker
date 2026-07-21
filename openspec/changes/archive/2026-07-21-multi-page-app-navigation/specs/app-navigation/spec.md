## ADDED Requirements

### Requirement: Shared top navigation
The application SHALL present a shared navigation bar on the Home/Edit, Profile, and API Docs
pages, providing links to all three pages plus the theme toggle and account chrome.

#### Scenario: Navigating between pages
- **WHEN** a user clicks the "Profile" link in the navigation bar from any of the three main
  pages
- **THEN** the user is taken to `/profile` and the navigation bar remains visible with
  "Profile" indicated as the active link

#### Scenario: Nav absent on auth pages
- **WHEN** a user is on `/sign-in` or `/sign-up`
- **THEN** the shared application navigation bar SHALL NOT be shown (the auth pages keep their
  own minimal header)

### Requirement: Active link indication
The navigation bar SHALL visually indicate which of the three pages is currently active.

#### Scenario: Home active state
- **WHEN** a user is on `/`
- **THEN** the "Home" (or equivalently labeled Edit) nav link is visually marked as active and
  the other links are not

### Requirement: Responsive navigation
The navigation bar SHALL remain usable (no overlapping elements, no horizontal overflow) at
mobile, tablet, and desktop viewport widths.

#### Scenario: Mobile nav rendering
- **WHEN** the navigation bar is viewed at a viewport width below 640px
- **THEN** all nav links, the theme toggle, and account chrome remain reachable without causing
  horizontal page scroll
