## ADDED Requirements

### Requirement: Single-action dual-mode export
The system SHALL produce both a light-mode and a dark-mode rendition of the current banner config from one export action, without requiring the user to toggle theme and re-export.

#### Scenario: Export produces both modes
- **WHEN** a user triggers export on a configured banner
- **THEN** the system renders the banner in both light and dark mode and delivers both outputs to the user in a single download action

#### Scenario: Export reflects current config for both modes
- **WHEN** a user has customized banner content (text, images, layout) and triggers export
- **THEN** both the light-mode and dark-mode outputs reflect that same content, differing only in theme-driven styling

### Requirement: Downloaded output is unambiguous per mode
The system SHALL make it clear to the user which downloaded file/asset is light mode and which is dark mode.

#### Scenario: Distinct file naming
- **WHEN** the dual export completes
- **THEN** each output file's name indicates its mode (e.g. contains "light" or "dark")

### Requirement: Export mode toggle removed from pre-export flow
The system SHALL remove the requirement to select a theme mode before exporting, since export now always produces both.

#### Scenario: No mode selection prompt
- **WHEN** a user opens the export action
- **THEN** the system does not ask them to choose light or dark mode before proceeding
