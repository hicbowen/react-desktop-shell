# Migration and deprecation guide

## Compatibility policy

The project follows semantic versioning. New APIs are additive in minor
releases. An API marked `@deprecated` remains functional for at least one minor
release and documents its replacement. Removal happens only in a major release,
unless the old API was never part of a published package.

Deprecations are recorded here and in [CHANGELOG.md](../CHANGELOG.md). Runtime
warnings are reserved for behavior that cannot be communicated adequately by
TypeScript or documentation.

## Moving to the next release from 0.22

### Package entry points

Root imports continue to work. Prefer domain entry points for new code:

```tsx
import { AppProvider } from 'react-desktop-shell/core'
import { AppDockWorkspace } from 'react-desktop-shell/navigation'
import { AppDataTable } from 'react-desktop-shell/data'
import 'react-desktop-shell/navigation/style.css'
```

AI and conversation components now have an explicit
`react-desktop-shell/ai` boundary. Test declarations are no longer included in
the published type tree.

### Provider and host integration

Use `AppProvider` when services are needed outside `AppShell`. Host-specific
clipboard, file picker, and window behavior belongs in its `platform` adapter;
components no longer need direct Wails, Electron, or Tauri imports.

### Commands

Prefer `commandId` on command-capable surfaces. Keep command labels, shortcuts,
disabled state, async execution, and errors in `AppCommandProvider` rather than
duplicating them in each toolbar or menu.

### Collection and data APIs

List and tree virtualization is opt-in through `virtualization`. Provide fixed
row heights and a `textValue` for non-text labels. Tree drop handlers must now
handle `before | inside | after`, not only `inside`.

`AppDataTable` accepts nested TanStack column definitions. Editing, tree rows,
and infinite loading are opt-in through `editing`, `treeRows`, and
`infiniteLoading`.

## Current deprecations

| Deprecated API                             | Replacement           |
| ------------------------------------------ | --------------------- |
| Shell sidebar `collapsed`                  | `displayMode`         |
| Shell sidebar `defaultCollapsed`           | `defaultDisplayMode`  |
| Shell sidebar `onCollapsedChange`          | `onDisplayModeChange` |
| Selector/navigation `onChange`             | `onValueChange`       |
| Conversation message `timestampVisibility` | `metaVisibility`      |

See the detailed [component reference](components.md) for examples and the
exact compatibility behavior retained by each deprecated prop.
