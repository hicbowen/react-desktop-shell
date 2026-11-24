# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## Unreleased

### Added

- Month and year navigation in the calendar header, including direct year
  entry in the standalone calendar and both date pickers.
- Bundled consumer skill and AI setup guide with version-aware component
  selection and public-import recipes adapted from the example application.
- Domain entry points and styles for core, forms, navigation, feedback, data,
  and AI consumers.
- Standalone `AppProvider` services and platform adapters.
- Shared async command execution across action surfaces, including shortcut
  conflict reporting.
- Virtualized ListView and TreeView interactions, range selection, typeahead,
  and precise tree drop positions.
- DataTable grouped headers, editable cells, tree rows, and infinite loading.
- Persistent `AppDockWorkspace` layouts with minimize and restore.

### Changed

- Anchored overlays share one branch-aware portal tree.
- Published declarations exclude test files.

## 0.22.1 - 2026-09-19

### Fixed

- Preserved composition-safe dialog form behavior and package metadata for the
  0.22 line.
