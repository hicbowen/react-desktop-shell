---
name: react-desktop-shell
description: Build and modify React UI using react-desktop-shell. Use when a user requests this library or the target project already uses it, including component selection, forms, desktop layouts, data views, commands, overlays, and conversation UI. Intended for consuming the library, not maintaining its internals.
---

# Use react-desktop-shell

Implement the requested UI using the installed library's public components,
preserving the consumer project's architecture and the user's design choices.
Choose existing components where they fit; use local composition for gaps.

## Establish the installed contract

1. Work from the consuming application's package directory, especially in a
   monorepo. Check its dependency declaration and resolved package version.
   With a Node-compatible installation, locate the package using:

   ```sh
   node -p "require.resolve('react-desktop-shell/package.json')"
   ```

   Use that package directory for subsequent reads. Do not assume a flat
   `node_modules` layout. If resolution fails, inspect the project's package
   manager and installation state before suggesting installation.

2. Read the resolved package's `package.json` exports and the relevant
   `dist/<domain>/index.d.ts` or `dist/index.d.ts`, following declaration
   re-exports as needed. Use its `docs/components.md` for behavioral details
   and `docs/migration.md` for migrations. Search for the relevant component;
   do not load the complete reference by default.
3. Treat the installed exports and declarations as authoritative for API
   availability. These recipes travel with a library release; a copied skill
   can be newer or older than the consumer's dependency. Prefer references
   from that installed package's `skills/react-desktop-shell/` when available.
   Do not assume that main-branch or Unreleased features exist in a published
   version. Explain a missing capability rather than inventing a prop or
   upgrading the dependency without need.

If the package or its docs are unavailable, use the matching release's public
documentation or ask for the missing API information. Do not fabricate an API
from another component library's conventions.

## Read only what the task needs

- Choosing controls or finding their entry points:
  [Component selection](references/components.md).
- First integration, CSS, Provider, shell, theme, locale, or platform adapters:
  [Composition](references/composition.md).
- Input values, validation, dynamic fields, dates, and selection controls:
  [Forms](references/forms.md).
- Tables, list/tree selection, virtualization, editing, and loading:
  [Data and collections](references/data.md).
- Tabs, dock panels, menus, keyboard shortcuts, and command execution:
  [Navigation and commands](references/navigation-actions.md).
- Dialogs, confirmation, context menus, toast, and anchored surfaces:
  [Feedback](references/feedback.md).
- Markdown, message threads, composers, tool activity, and change review:
  [Conversation UI](references/ai.md).

## Implementation rules

- Use documented package exports. Never copy the example app's `../../src`
  imports or import internal `dist/*` modules into consumer code.
- Keep the existing root-import or domain-import strategy when practical.
  `react-desktop-shell/style.css` works with either strategy. For selective
  CSS, include `core/style.css` plus the required domain styles, including
  nested controls. Domain CSS is not a complete transitive dependency bundle;
  use aggregate CSS for composed widgets when coverage is uncertain. Some
  public components exist only in the root entry; consult the index.
- Reuse the existing `AppShell` or `AppProvider` boundary. Both establish
  services and overlay hosts. A nested shell has its own service settings;
  do not add a redundant provider expecting its settings to configure it.
  Command registration separately uses `AppCommandProvider`.
- Match the actual value and event contract. `AppTextBox` uses native
  `onChange`; `AppSelect` uses `onValueChange` with `string | null`;
  checkbox/switch controls use `onCheckedChange`. Controlled values must be
  updated by the consumer.
- Use public props, slots, and theme tokens before depending on internal DOM
  or overriding internal selectors. Preserve built-in keyboard handling and
  provide accessible names for icon-only controls.
- Keep routing, application data, persistence beyond component options, AI
  transport, and host runtime operations in the consuming application.
  Example timers, no-op callbacks, and fixtures are demonstrations, not
  implementations of those services.

## Verify the integration

Run the consumer's relevant existing typecheck or build when available. Check
the changed UI for its value updates, required CSS, provider placement, and
keyboard interaction. Report any unverified host or backend behavior. Use the
project's existing validation approach; this skill does not require adding a
test framework, CI workflow, or unrelated dependency.
