# profile-page Specification

## Purpose
TBD - created by archiving change multi-page-app-navigation. Update Purpose after archive.
## Requirements
### Requirement: Profile access requires authentication
The `/profile` page SHALL be accessible only to authenticated users; unauthenticated visitors
SHALL be redirected to `/sign-in`.

#### Scenario: Anonymous visit redirects
- **WHEN** an unauthenticated visitor navigates to `/profile`
- **THEN** they are redirected to `/sign-in`

#### Scenario: Authenticated visit renders
- **WHEN** an authenticated user navigates to `/profile`
- **THEN** the profile page renders their account overview and saved config history

### Requirement: Account overview
The profile page SHALL display the signed-in user's account email and provide a sign-out
action.

#### Scenario: Sign out from profile
- **WHEN** an authenticated user clicks "Sign out" on the profile page
- **THEN** their session ends and they are no longer authenticated

### Requirement: Editable banner config history
The profile page SHALL list the authenticated user's saved banner configs (history) and allow
each entry to be renamed, deleted, and loaded into the editor.

#### Scenario: Renaming a saved config
- **WHEN** a user edits the name of a saved config on the profile page and confirms
- **THEN** the config's name is updated via the existing banner-configs API and the updated
  name is reflected in the list without a full page reload

#### Scenario: Deleting a saved config
- **WHEN** a user deletes a saved config from the profile page
- **THEN** the config is removed via the existing banner-configs API and no longer appears in
  the list

#### Scenario: Loading a saved config into the editor
- **WHEN** a user clicks "Load" on a saved config on the profile page
- **THEN** they are navigated to the Home/Edit page (`/`) with that config's values applied to
  the editor

#### Scenario: Empty history state
- **WHEN** an authenticated user with no saved configs visits the profile page
- **THEN** a clear empty state is shown instead of an empty list, with guidance to create a
  banner on the Home/Edit page

