## ADDED Requirements

### Requirement: Account creation
The system SHALL allow a visitor to create an account using an email and password.

#### Scenario: Successful sign-up
- **WHEN** a visitor submits a valid, unused email and a password meeting the minimum strength policy
- **THEN** the system creates a new `User` record with a securely hashed password and starts an authenticated session

#### Scenario: Duplicate email rejected
- **WHEN** a visitor submits an email that already has an account
- **THEN** the system rejects the sign-up with a clear error and does not create a duplicate account

### Requirement: Authentication
The system SHALL allow a user with an existing account to sign in and sign out.

#### Scenario: Successful sign-in
- **WHEN** a user submits the correct email and password for an existing account
- **THEN** the system starts an authenticated session for that user

#### Scenario: Incorrect credentials rejected
- **WHEN** a user submits an email/password combination that does not match any account
- **THEN** the system rejects the sign-in with a generic error that does not reveal whether the email exists

#### Scenario: Sign-out
- **WHEN** an authenticated user triggers sign-out
- **THEN** the system ends their session and subsequent requests are treated as unauthenticated

### Requirement: Per-user config persistence
The system SHALL allow an authenticated user to save, list, update, and delete their own banner configs.

#### Scenario: Save a new config
- **WHEN** an authenticated user saves the current banner config with a name
- **THEN** the system persists a `BannerConfig` record associated with that user's account

#### Scenario: Load saved configs
- **WHEN** an authenticated user opens the studio
- **THEN** the system lists only the banner configs belonging to that user

#### Scenario: Update an existing config
- **WHEN** an authenticated user edits and re-saves a config they own
- **THEN** the system updates that `BannerConfig` record in place

#### Scenario: Delete a config
- **WHEN** an authenticated user deletes a config they own
- **THEN** the system removes that `BannerConfig` record and it no longer appears in their list

#### Scenario: Users cannot access each other's configs
- **WHEN** an authenticated user attempts to load, update, or delete a `BannerConfig` belonging to a different user
- **THEN** the system denies the request

### Requirement: Anonymous usage without persistence
The system SHALL continue to allow unauthenticated visitors to configure and export banners without an account, without persistence across sessions.

#### Scenario: Anonymous export still works
- **WHEN** a visitor without an account configures a banner and exports it
- **THEN** the system produces the export normally without requiring sign-in

#### Scenario: Anonymous config is not saved
- **WHEN** a visitor without an account refreshes or closes the page
- **THEN** their in-progress banner config is not persisted anywhere
