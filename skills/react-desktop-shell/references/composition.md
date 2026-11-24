# Composition, styles, and host services

## Imports and CSS

For a simple integration, import public components from `react-desktop-shell`
and import `react-desktop-shell/style.css` once at the application boundary.
For domain imports, include `react-desktop-shell/core/style.css` once, then
each used domain's `style.css`. Follow actual package exports; do not assume
every root export appears in a domain.

Domain styles currently group component rules rather than computing the full
transitive style graph. Nested components may need another domain's rules:
the AI composer embeds a form textarea; table menus use form/feedback controls,
and table pagination uses a root-only component. For these compositions use
the aggregate stylesheet, which works with domain JavaScript imports too.
Do not assume importing domain JavaScript automatically brings in its CSS.

The library does not require the example application's icon wrappers or CSS.
Keep the consumer's icon library, or pass suitable React nodes into icon slots.

## Choose the service boundary

- `AppShell` provides desktop layout, locale, theme, platform services, and
  overlay hosts. Configure these directly on the shell.
- `AppProvider` provides services and styling without a title bar, rail, or
  page layout. Use it around standalone or embedded library UI.
- Both create their own service contexts. An outer Provider's theme, locale,
  platform, or toast configuration does not automatically configure a nested
  `AppShell`; avoid introducing this nesting without an intentional boundary.
- Hooks such as `useAppToast`, `useAppMessageBox`, and `useAppContextMenu` must
  run in a child below the boundary. Returning a Provider from the same
  component that calls the hook does not wrap that hook call.
- `AppCommandProvider` is separate. Add it around the surfaces sharing commands.

## Minimal shell

Adapted from `example/src/App.tsx`; replaces demo navigation and window mocks
with local page state. Browser-only examples hide native window controls.

```tsx
import { useState } from 'react'
import { AppPage, AppShell, AppTitleBar } from 'react-desktop-shell/core'
import { AppRail } from 'react-desktop-shell/navigation'
import 'react-desktop-shell/core/style.css'
import 'react-desktop-shell/navigation/style.css'

export function DesktopFrame() {
  const [page, setPage] = useState('home')
  return (
    <AppShell
      title="My app"
      locale="en-US"
      theme="system"
      sidebar={{ displayMode: 'auto' }}
      titleBar={
        <AppTitleBar showMinimize={false} showMaximize={false} showClose={false} />
      }
      rail={
        <AppRail
          value={page}
          onValueChange={setPage}
          items={[
            { key: 'home', label: 'Home' },
            { key: 'settings', label: 'Settings' },
          ]}
        />
      }
    >
      <AppPage title={page === 'home' ? 'Home' : 'Settings'}>
        <p>{page === 'home' ? 'Home content' : 'Settings content'}</p>
      </AppPage>
    </AppShell>
  )
}
```

Use the consumer's router when one exists. `AppRail` reports selection; it does
not configure routes. The example's `DemoPage`, `DemoPreview`, `DemoSection`,
translation helpers, and demo icon modules are not public library exports.

## Layout and customization

- Establish a bounded height on the consumer's app mount for a full-window
  shell. Use `AppPage layout="flow"` for flowing content and `layout="fill"`
  for a bounded workspace; ensure flex/grid ancestors can shrink with
  `min-height: 0` and `min-width: 0` where needed.
- Give virtualized tables/lists, dock workspaces, and conversation viewports a
  bounded viewport. Adding a scrolling wrapper to every layer can produce
  competing scroll areas.
- `theme` is `system | light | dark`; `themePreset` chooses an accent palette
  such as `blue` or `violet`. `themeTokens` accepts `common`, `light`, and `dark`
  color overrides. Read the installed `AppThemeTokens` before adding keys.
- Theme scope is the shell/provider subtree. Keep consumer layout styles
  local; use public `className`, `style`, and slots for composition.
- `locale` accepts `system` or a locale string. Built-in messages are provided
  for `en-US` and `zh-CN`; other locales use English messages unless overridden
  with `messages`, while their locale string is used for formatting.
  Application-owned text still needs its own translation. `firstDayOfWeek`
  and `hourCycle` configure date/time controls.
- Shell content disables text selection by default. For copyable prose or
  logs, opt in with `data-app-selectable="true"` or `app-shell__selectable`.

## Desktop runtime boundary

`platform` accepts an `AppPlatformAdapter`: optional `clipboard`, `filePicker`,
`window`, and `openExternal` integrations. Implement the functions using the
consumer's existing host bridge. Native window controls need real callbacks
or `platform.window`; keep `maximized` synchronized with host events.

The file-picker adapter's `pick` resolves browser `File` objects, not native
path strings. Converting host file handles or paths belongs in the adapter.
Window dragging and runtime permissions also belong to the host integration;
the title bar alone does not configure an Electron, Tauri, or Wails window.

For embedded controls, use `AppProvider` with the needed configuration and
render the controls below it. Do not add a desktop frame just to access toast,
theme, or locale services.
