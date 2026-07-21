# api-docs-page Specification

## Purpose
TBD - created by archiving change multi-page-app-navigation. Update Purpose after archive.
## Requirements
### Requirement: Standalone API reference page
The application SHALL provide an `/api-docs` page documenting the banner render API, including
the endpoint, request parameters, and example requests, accessible without authentication.

#### Scenario: Viewing API docs anonymously
- **WHEN** an unauthenticated visitor navigates to `/api-docs`
- **THEN** the page renders the full API reference without requiring sign-in

### Requirement: Multi-language request snippets
The API Docs page SHALL provide copyable example requests in multiple languages, using the same
snippet-generation logic as the rest of the app (single source of truth).

#### Scenario: Switching snippet language
- **WHEN** a user selects a different language tab on the API Docs page
- **THEN** the displayed example request updates to that language's syntax for the same example
  payload

#### Scenario: Copying a snippet
- **WHEN** a user clicks "Copy" on a displayed snippet
- **THEN** the snippet text is copied to the clipboard

### Requirement: Parameter reference
The API Docs page SHALL document every request parameter accepted by the banner render API
(content fields, style fields, variant, size/format options), derived from the same shared
types used by the editor so the two never drift apart.

#### Scenario: Parameter table completeness
- **WHEN** a developer reads the parameter reference table on the API Docs page
- **THEN** every field present in the editor's Tweaks/export options is listed with its name and
  a brief description

