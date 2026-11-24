# Navigation, workspaces, and commands

## Tabs and dock panels

Use `/navigation` with `core/style.css` and `navigation/style.css`.
`AppTabView` receives `items` with `key`, `label`, and `content`. It reports
selection with `value` / `onValueChange`, closing with `onTabClose(key)`, and
reordering with `onTabReorder(fromIndex, toIndex)`.

Adapted from `example/src/pages/navigation/TabViewPage.tsx`:

```tsx
import { useState } from 'react'
import { AppTabView, type AppTabViewItem } from 'react-desktop-shell/navigation'
import 'react-desktop-shell/core/style.css'
import 'react-desktop-shell/navigation/style.css'

export function DocumentTabs() {
  const [items, setItems] = useState<AppTabViewItem[]>([
    { key: 'readme', label: 'README.md', content: <p>Documentation</p>, pinned: true },
    { key: 'notes', label: 'Notes', content: <p>Notes</p> },
  ])
  const [active, setActive] = useState('readme')
  return (
    <AppTabView
      items={items}
      value={active}
      onValueChange={setActive}
      onTabClose={(key) => {
        const index = items.findIndex((item) => item.key === key)
        if (index < 0 || items[index]?.pinned) return
        const nextActive = items[index + 1]?.key ?? items[index - 1]?.key ?? ''
        setItems((current) => current.filter((item) => item.key !== key))
        if (active === key) setActive(nextActive)
      }}
      onTabReorder={(from, to) =>
        setItems((current) => {
          const next = [...current]
          const [moved] = next.splice(from, 1)
          if (moved) next.splice(to, 0, moved)
          return next
        })
      }
    />
  )
}
```

The application owns item removal and order. `dirty` is a visual state, not a
save-confirmation workflow. Implement any required save decision before
removing a dirty tab. `pinned` prevents the built-in close/drag actions.
`mountStrategy="unmount"` is the default; use `hidden` when inactive content
must stay mounted, understanding that hidden components' effects still run.

For tab context menus, call `event.preventDefault()` in `onTabContextMenu`,
then use `useAppContextMenu().open` with item actions and the event position.
Close-others, close-right, and pin/unpin are application-owned item updates,
as demonstrated in the example; they are not additional TabView props.

`AppDockWorkspace` places panels in `left | right | bottom` regions around
`children`. Each panel has `key`, `title`, `content`, and `position`.
`persistenceKey` restores region sizes, active panels, and minimized panels;
it does not serialize React content, document data, or open document tabs.
Use `layout` / `onLayoutChange` for controlled layout. The `storage` option
accepts synchronous `getItem` / `setItem`, not an async backend.

## Shared commands

Commands come from `/core`; toolbars and menu surfaces come from `/navigation`.
`AppCommandPalette` currently comes from the root entry, so the following
recipe uses root imports and the aggregate stylesheet. It extends the example
palette page's explicit `commands` with shared provider registration.

```tsx
import { useMemo, useState } from 'react'
import {
  AppButton,
  AppCommandPalette,
  AppCommandProvider,
  AppToolbar,
  type AppCommand,
} from 'react-desktop-shell'
import 'react-desktop-shell/style.css'

export function SaveCommands({
  save,
  isMac,
}: {
  save: () => Promise<void>
  isMac: boolean
}) {
  const [open, setOpen] = useState(false)
  const commands = useMemo<AppCommand[]>(
    () => [
      {
        id: 'file.save',
        label: 'Save',
        shortcut: isMac ? { meta: true, key: 's' } : { ctrl: true, key: 's' },
        allowInEditable: true,
        execute: () => save(),
      },
    ],
    [isMac, save],
  )
  return (
    <AppCommandProvider commands={commands}>
      <AppToolbar actions={[{ commandId: 'file.save' }]} />
      <AppButton onClick={() => setOpen(true)}>Commands</AppButton>
      <AppCommandPalette open={open} onOpenChange={setOpen} />
    </AppCommandProvider>
  )
}
```

Render this below the application's existing shell/provider. A palette can
also receive `commands` explicitly, but that alone does not register document
keyboard shortcuts. `AppCommandProvider` performs shortcut registration.

- Shortcut modifiers are explicit `ctrl`, `meta`, `alt`, and `shift` booleans;
  there is no `mod` field. `formatAppShortcut` formats a shortcut; it does
  not turn Ctrl into Command automatically.
- Editable targets are skipped unless `allowInEditable` is enabled. Native
  global shortcuts outside the focused document require a host integration.
- `useAppCommandState(id)` returns pending/error state for a custom action
  surface. `useAppCommands().execute(id)` returns whether execution was
  accepted, not a Promise proving completion. Handle completion in the
  command implementation and expose failures in the UI as appropriate.
- `AppButton` itself has no `commandId` prop. Use a command-aware toolbar/menu
  surface, or call `useAppCommands().execute` from a button below the provider.
- Nested command providers merge IDs; do not assume this implements
  focus-scoped shortcut dispatch. Check the installed API before designing
  multiple competing keyboard scopes.
