# Changelog

All notable changes to the "Auto Select Pasted Text" extension will be documented in this file.

## [0.3.3] - 2023-10-17
### Fixed
- Resolved bug where certain edge cases could not differentiate auto vs manual selection operations.

## [0.3.2] - 2023-10-11
- Added demo gif to README.md

## [0.3.1] - 2023-10-11
- Updated marketplace keywords

## [0.3.0] - 2023-10-11
### Added
- Implemented `enableLogging` setting to conditionally log extension activities.
- Introduced a toggle command for the `enableLogging` setting.
- Created a utility function to handle conditional logging based on the `enableLogging` setting.
  
### Changed
- Refactored the paste command to utilize the `enableAutoSelection` setting.
- Adjusted the type command to handle both auto and manual selection behaviors.
  
### Fixed
- Addressed inconsistencies in the configuration and command naming.
- Resolved an issue with the logging setting not updating immediately.

## [0.2.1] - 2023-10-10
- Updated README.md

## [0.2.0] - 2023-10-09
- Added tracking to distinguish between auto-selection vs manual selection.
- Added logic to not perform auto actions on manually selected text.

## [0.1.9] - 2023-10-08
- Updated changelog.

## [0.1.8] - 2023-10-08

### Added
- Implemented behavior to deselect text when alphanumeric, symbol, space, or enter keys are pressed while text is selected. This streamlines the editing experience, allowing users to continue typing seamlessly after pasting content.
- Enhanced extension activation logic to specifically cater to the keys of interest, optimizing performance.

## [0.1.7] - 2023-09-18
- Finalized testing for public release.
- Updated README to better explain the utility and importance of the extension.

## [0.1.6] - 2023-09-18
- Added relevant keywords for Marketplace.

## [0.1.5] - 2023-09-18

### Added
- Enhanced logic to detect repeated pastes, ensuring that the pasting experience is smooth and consistent.
- Improved handling of selection after paste operation, including multi-line content.
- Extension now logs selection changes and pasting activity to an output channel named "AutoSelectPaste" for debugging purposes.
- Updated README to better explain the utility and importance of the extension.

## [0.1.4] - 2023-09-17

### Fixed
- Corrected the logic to calculate the end position after pasting, ensuring accurate text selection.
- Addressed potential issues with repeated pasting of the same content.

## [0.1.3] - 2023-09-16

### Added
- Initial release of the "Auto Select Pasted Text" extension.
- Basic functionality to automatically select text after it is pasted into VSCode.

### Notes
- Future updates will refine the behavior and offer additional features based on user feedback.
