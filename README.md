# react-desktop-shell

Native-feeling, host-neutral React components for desktop applications. The
library includes an application shell, commands and menus, forms, data views,
feedback surfaces, AI/conversation UI, and scalable workspace collections.

## Install

```bash
npm install react-desktop-shell react react-dom
```

Import the root bundle for convenience:

```tsx
import { AppProvider, AppShell } from 'react-desktop-shell'
import 'react-desktop-shell/style.css'
```

For smaller dependency and style graphs, import a domain entry point:

```tsx
import { AppTextBox, AppDatePicker } from 'react-desktop-shell/forms'
import 'react-desktop-shell/forms/style.css'
```

Available domains are `core`, `forms`, `navigation`, `feedback`, `data`, and
`ai`. `react-desktop-shell/data` requires `@tanstack/react-table` when using
`AppDataTable`.

## Quick start

```tsx
import {
  AppCommandProvider,
  AppProvider,
  AppShell,
  type AppCommand,
} from 'react-desktop-shell'
import 'react-desktop-shell/style.css'

const commands: AppCommand[] = [
  {
    id: 'file.save',
    label: 'Save',
    shortcut: { ctrl: true, key: 's' },
    execute: () => saveDocument(),
  },
]

export function App() {
  return (
    <AppProvider locale="en-US">
      <AppCommandProvider commands={commands}>
        <AppShell title="My desktop app">
          <Workspace />
        </AppShell>
      </AppCommandProvider>
    </AppProvider>
  )
}
```

`AppProvider` can be used without `AppShell`. It owns locale, messages, theme,
and optional platform adapters for clipboard, file picking, and host-window
operations. The shell adds desktop layout and overlay hosts.

## What is included

- Desktop shell, title bar, rail, pages, side panes, resizable panes, tabs, and
  persistent dock workspaces.
- One command model shared by toolbars, menus, context menus, split buttons,
  the command palette, and keyboard shortcuts.
- Form controls, date/time controls, field validation, dynamic form lists, and
  localized built-in messages.
- Virtualized ListView and TreeView with typeahead, range selection, lazy trees,
  and precise tree drop positions.
- DataTable with sorting, filtering, selection, grouped headers, editing, tree
  rows, pagination, virtualization, and infinite loading.
- Dialogs, popovers, tooltips, teaching tips, toasts, task progress, and other
  feedback surfaces on shared overlay infrastructure.
- AI markdown, conversation, quick-ask, tool activity, and change-review UI in
  the separate `ai` entry point.

## Documentation

- [Component and API reference](docs/components.md)
- [Migration and deprecation guide](docs/migration.md)
- [Release process](docs/releasing.md)
- [Changelog](CHANGELOG.md)

The example application is available in [`example/`](example/).

## Development

```bash
npm install
npm run dev
npm run verify
```

`verify` runs formatting checks, lint, the existing test suite, a production
build, and package-contract validation. `verify:publish` keeps the publish gate
lighter by omitting the full test suite while retaining static and artifact
checks.

## License

[MIT](LICENSE)
