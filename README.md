# react-desktop-shell

A lightweight native-like desktop app shell for React, featuring a custom title bar and navigation rail.

## Installation

```bash
npm install react-desktop-shell
```

## Basic Usage

```tsx
import { useState } from 'react'
import { FileText, Home, Settings, Wrench } from 'lucide-react'

import { AppPage, AppRail, AppShell, AppTitleBar } from 'react-desktop-shell'
import 'react-desktop-shell/style.css'

function App() {
  const [active, setActive] = useState('home')
  const [maximized, setMaximized] = useState(false)

  return (
    <AppShell
      titleBar={
        <AppTitleBar
          title="My App"
          actions={<ToolbarActions />}
          onMinimize={handleMinimize}
          maximized={maximized}
          onToggleMaximize={() => setMaximized((current) => !current)}
          onClose={handleClose}
        />
      }
      rail={
        <AppRail
          value={active}
          onChange={setActive}
          items={[
            {
              key: 'home',
              label: 'Home',
              icon: <Home size={16} />,
            },
            {
              type: 'group',
              label: 'Workspace',
            },
            {
              key: 'files',
              label: 'Files',
              icon: <FileText size={16} />,
            },
            {
              key: 'tools',
              label: 'Tools',
              icon: <Wrench size={16} />,
              disabled: true,
            },
          ]}
          footerItems={[
            {
              key: 'settings',
              label: 'Settings',
              icon: <Settings size={16} />,
            },
          ]}
        />
      }
    >
      <AppPage
        key={active}
        title={currentPage.title}
        description={currentPage.description}
        actions={currentPage.actions}
      >
        <CurrentPage />
      </AppPage>
    </AppShell>
  )
}
```

## App Shell

`AppShell` composes the title bar, navigation rail, and content area into a full-height desktop shell. The shell owns layout, content scrolling, and the background split between app chrome and page content.

```tsx
<AppShell
  theme="system"
  titleBar={<AppTitleBar title="My App" />}
  rail={<AppRail value={active} items={items} onChange={setActive} />}
>
  <HomePage />
</AppShell>
```

## Theme

`AppShell` supports light, dark, and system themes.

```tsx
<AppShell theme="system">...</AppShell>
<AppShell theme="light">...</AppShell>
<AppShell theme="dark">...</AppShell>
```

`system` is the default theme and follows the operating system color scheme through `prefers-color-scheme`. The theme is scoped to `AppShell` and does not modify `html`, `body`, or global application theme state.

## App Page

`AppPage` provides a consistent content-page layout with a title, description, actions area, and a subtle enter animation.

```tsx
<AppPage
  title="Settings"
  description="Manage application preferences."
>
  <SettingsPanel />
</AppPage>
```

Use `actions` for page-level commands rendered in the top-right of the page header.

```tsx
<AppPage
  title="Students"
  actions={<button>Add student</button>}
>
  <StudentList />
</AppPage>
```

`AppPage` plays a subtle fade-and-rise enter animation by default and respects `prefers-reduced-motion`. Pass `animated={false}` to disable it.

```tsx
<AppPage animated={false}>
  <StaticContent />
</AppPage>
```

CSS animations replay when React remounts the page. Use a `key` when switching pages.

```tsx
<AppPage
  key={activePage}
  title={currentPage.title}
  description={currentPage.description}
>
  {renderPage(activePage)}
</AppPage>
```

### Preserving Page State

With React 19.2+, `AppPage` works well with React `Activity` for desktop-style page navigation. `Activity` can preserve page UI, DOM state, and internal component state while a page is hidden, while `AppPage` continues to provide the visible page layout and enter animation.

```tsx
import { Activity } from 'react'

{pages.map((page) => (
  <Activity
    key={page.key}
    mode={activePage === page.key ? 'visible' : 'hidden'}
  >
    <AppPage
      title={page.title}
      description={page.description}
    >
      {renderPage(page.key)}
    </AppPage>
  </Activity>
))}
```

The enter animation may replay when an `Activity` becomes visible, depending on browser animation behavior. `AppPage` also continues to support `prefers-reduced-motion`.

## Title Bar

`AppTitleBar` renders the custom title bar UI. Window actions are provided by the host application through callbacks, making it compatible with Wails, Electron, Tauri, or other desktop runtimes.

```tsx
<AppTitleBar
  title="My App"
  icon={<AppIcon />}
  actions={<ToolbarActions />}
  onMinimize={handleMinimize}
  maximized={maximized}
  onToggleMaximize={handleToggleMaximize}
  onClose={handleClose}
/>
```

If `onMinimize`, `onToggleMaximize`, or `onClose` are omitted, clicking the matching button is a safe no-op. Pass `maximized` to switch the maximize button into its restore state. Use `actions` for custom title bar controls rendered to the left of the window buttons.

## Rail

`AppRail` renders the navigation surface and includes a subtle direction-aware selection indicator animation.

Disabled rail items cannot be selected and do not trigger `onChange`. A controlled `value` may still reference a disabled item; `AppRail` does not modify the host application's selection state.

## Groups

Use group entries to separate related navigation items. Group labels are hidden while the rail is collapsed.

```tsx
{
  type: 'group',
  label: 'Workspace',
}
```

## Footer Items

Footer items stay pinned to the bottom of the rail.

```tsx
<AppRail
  value={active}
  onChange={setActive}
  items={items}
  footerItems={[
    {
      key: 'settings',
      label: 'Settings',
      icon: <Settings size={16} />,
    },
  ]}
/>
```

## Collapse

`AppRail` automatically collapses when the viewport width is below `collapseBreakpoint`, which defaults to `700`. Use `onCollapsedChange` to observe uncontrolled auto-collapse changes.

```tsx
<AppRail
  onCollapsedChange={setCollapsed}
  items={items}
/>
```

Pass `collapsed` to fully control the collapsed state.

```tsx
<AppRail
  collapsed={collapsed}
  items={items}
/>
```

## CSS Variables

Override variables on `.app-shell`, `.app-page`, `.app-rail`, and `.app-title-bar` to customize the components.

```css
.app-shell {
  --app-shell-chrome-bg: #f3f3f3;
  --app-shell-content-bg: #f7f8fa;
  --app-shell-content-margin: 0 5px 5px 0;
  --app-shell-content-radius: 10px;
}

.app-page {
  --app-page-padding: 32px;
}

.app-rail {
  --app-rail-width: 240px;
  --app-rail-accent-color: #ff4d4f;
}

.app-title-bar {
  --app-title-bar-height: 44px;
}
```

| Variable                           | Default               |
| ---------------------------------- | --------------------- |
| `--app-shell-chrome-bg`            | `#f3f3f3`             |
| `--app-shell-content-bg`           | `#f7f8fa`             |
| `--app-shell-text-color`           | `#1f1f1f`             |
| `--app-shell-muted-text-color`     | `#707070`             |
| `--app-shell-disabled-text-color`  | `rgb(0 0 0 / 36%)`   |
| `--app-shell-hover-bg`             | `rgb(0 0 0 / 5%)`     |
| `--app-shell-control-hover-bg`     | `#d4d4d4`             |
| `--app-shell-active-bg`            | `#edf3fb`             |
| `--app-shell-border-color`         | `rgb(0 0 0 / 8%)`     |
| `--app-shell-accent-color`         | `#115ea3`             |
| `--app-shell-danger-bg`            | `#ef4444`             |
| `--app-shell-content-margin`       | `0 5px 5px 0`         |
| `--app-shell-content-radius`       | `10px`                |
| `--app-shell-content-border-color` | `var(--app-shell-border-color)` |
| `--app-page-padding`               | `24px`                |
| `--app-page-header-gap`            | `8px`                 |
| `--app-page-content-gap`           | `24px`                |
| `--app-page-title-size`            | `28px`                |
| `--app-page-title-weight`          | `600`                 |
| `--app-page-text-color`            | `var(--app-shell-text-color, #1f1f1f)` |
| `--app-page-muted-text-color`      | `var(--app-shell-muted-text-color, #707070)` |
| `--app-rail-width`                 | `228px`               |
| `--app-rail-collapsed-width`       | `56px`                |
| `--app-rail-text-color`            | `var(--app-shell-text-color, #1f1f1f)` |
| `--app-rail-muted-text-color`      | `var(--app-shell-muted-text-color, rgba(0, 0, 0, 0.58))` |
| `--app-rail-hover-bg`              | `var(--app-shell-hover-bg, rgba(0, 0, 0, 0.05))` |
| `--app-rail-accent-color`          | `var(--app-shell-accent-color, #115ea3)` |
| `--app-rail-accent-bg`             | `var(--app-shell-active-bg, #edf3fb)` |
| `--app-rail-disabled-text-color`   | `var(--app-shell-disabled-text-color, rgb(0 0 0 / 36%))` |
| `--app-rail-bg`                    | `transparent`         |
| `--app-title-bar-height`           | `40px`                |
| `--app-title-bar-text-color`       | `var(--app-shell-text-color, #1f1f1f)` |
| `--app-title-bar-icon-color`       | `var(--app-shell-accent-color, #115ea3)` |
| `--app-title-bar-hover-bg`         | `var(--app-shell-control-hover-bg, #d4d4d4)` |
| `--app-title-bar-danger-bg`        | `var(--app-shell-danger-bg, #ef4444)` |
| `--app-title-bar-bg`               | `transparent`         |

Child components use `AppShell` theme tokens as defaults while keeping their existing component-level CSS variables customizable.

## Context menu

`AppShell` keeps the browser or WebView context menu by default.

```tsx
<AppShell contextMenu="native">...</AppShell>
```

Use `contextMenu="app"` to let the shell own right-click behavior and render a consistent desktop menu layer.

```tsx
<AppShell contextMenu="app">
  <Workspace />
</AppShell>
```

Custom menus are data-driven and can wrap any single React element without changing its semantics.

```tsx
<AppContextMenu
  items={[
    { key: 'open', label: 'Open', onClick: openItem },
    { key: 'copy', label: 'Copy', shortcut: 'Ctrl+C', onClick: copyItem },
    { type: 'separator' },
    { key: 'delete', label: 'Delete', danger: true, onClick: deleteItem },
  ]}
>
  <Item />
</AppContextMenu>
```

When `contextMenu="app"` is enabled, the shell resolves menus in this order:

1. The nearest enabled `AppContextMenu`
2. Built-in editable element menu for `input`, `textarea`, and `contenteditable`
3. Built-in selected text menu
4. No menu

The built-in editable menu includes Undo, Cut, Copy, Paste, Delete, and Select all. Clipboard access uses the Web Clipboard API by default, and failures are handled without crashing the menu. Desktop hosts can provide their own adapter.

```tsx
<AppShell
  contextMenu="app"
  clipboard={{
    readText,
    writeText,
  }}
>
  <App />
</AppShell>
```

This is intended for Wails, Electron, Tauri, or other hosts that want to bridge native clipboard APIs without adding a runtime dependency to `react-desktop-shell`.

## API

### AppShellProps

| Prop               | Type            | Default     | Description                                      |
| ------------------ | --------------- | ----------- | ------------------------------------------------ |
| `theme`            | `'system' \| 'light' \| 'dark'` | `'system'` | Controls the shell color theme. |
| `contextMenu`      | `'native' \| 'app'` | `'native'` | Controls whether native or shell-managed context menus are used. |
| `clipboard`        | `AppClipboardAdapter` | Web Clipboard API | Optional clipboard bridge used by shell-managed menus. |
| `contextMenuLocale` | `Partial<AppContextMenuLocale>` | English labels | Optional labels for built-in context menu items. |
| `titleBar`         | `ReactNode`     | `undefined` | Title bar content rendered above the body.       |
| `rail`             | `ReactNode`     | `undefined` | Navigation rail content rendered beside content. |
| `children`         | `ReactNode`     | `undefined` | Main content rendered in the scrollable area.    |
| `className`        | `string`        | `undefined` | Additional class name for the root element.      |
| `style`            | `CSSProperties` | `undefined` | Inline styles for the root element.              |
| `contentClassName` | `string`        | `undefined` | Additional class name for the content element.   |
| `contentStyle`     | `CSSProperties` | `undefined` | Inline styles for the content element.           |

### AppPageProps

| Prop               | Type            | Default     | Description                                       |
| ------------------ | --------------- | ----------- | ------------------------------------------------- |
| `title`            | `ReactNode`     | `undefined` | Page title rendered in the header.                |
| `description`      | `ReactNode`     | `undefined` | Supporting text rendered below the title.         |
| `actions`          | `ReactNode`     | `undefined` | Page-level actions rendered on the top right.     |
| `children`         | `ReactNode`     | `undefined` | Page content rendered below the header.           |
| `animated`         | `boolean`       | `true`      | Enables the subtle fade-and-rise enter animation. |
| `className`        | `string`        | `undefined` | Additional class name for the root element.       |
| `style`            | `CSSProperties` | `undefined` | Inline styles for the root element.               |
| `contentClassName` | `string`        | `undefined` | Additional class name for the content element.    |
| `contentStyle`     | `CSSProperties` | `undefined` | Inline styles for the content element.            |

### AppRailProps

| Prop                 | Type                           | Default     | Description                                                |
| -------------------- | ------------------------------ | ----------- | ---------------------------------------------------------- |
| `value`              | `string`                       | `undefined` | The active item key.                                       |
| `items`              | `RailEntry[]`                  | Required    | Main rail entries.                                         |
| `footerItems`        | `RailItem[]`                   | `[]`        | Items pinned to the bottom of the rail.                    |
| `onChange`           | `(key: string) => void`        | `undefined` | Called when a navigation item is clicked.                  |
| `collapsed`          | `boolean`                      | `undefined` | Controls the collapsed state when provided.                |
| `collapseBreakpoint` | `number`                       | `700`       | Viewport width below which the rail auto-collapses.        |
| `onCollapsedChange`  | `(collapsed: boolean) => void` | `undefined` | Called when the uncontrolled auto-collapsed state changes. |
| `className`          | `string`                       | `undefined` | Additional class name for the root element.                |
| `style`              | `CSSProperties`                | `undefined` | Inline styles for the root element.                        |

### AppTitleBarProps

| Prop               | Type            | Default     | Description                                            |
| ------------------ | --------------- | ----------- | ------------------------------------------------------ |
| `title`            | `ReactNode`     | `undefined` | App title content.                                     |
| `icon`             | `ReactNode`     | `undefined` | App icon content.                                      |
| `actions`          | `ReactNode`     | `undefined` | Custom controls rendered before the window buttons.    |
| `onMinimize`       | `() => void`    | `undefined` | Called when the minimize button is clicked.            |
| `maximized`        | `boolean`       | `false`     | Switches the maximize button into its restore state.   |
| `onToggleMaximize` | `() => void`    | `undefined` | Called when the maximize or restore button is clicked. |
| `onClose`          | `() => void`    | `undefined` | Called when the close button is clicked.               |
| `showMinimize`     | `boolean`       | `true`      | Shows the minimize button.                             |
| `showMaximize`     | `boolean`       | `true`      | Shows the maximize button.                             |
| `showClose`        | `boolean`       | `true`      | Shows the close button.                                |
| `className`        | `string`        | `undefined` | Additional class name for the root element.            |
| `style`            | `CSSProperties` | `undefined` | Inline styles for the root element.                    |

## Types

```tsx
import type { CSSProperties, ReactNode } from 'react'

export type AppTheme = 'system' | 'light' | 'dark'

export type RailItem = {
  type?: 'item'
  key: string
  label: string
  icon?: ReactNode
  disabled?: boolean
}

export type RailGroup = {
  type: 'group'
  label: string
}

export type RailEntry = RailItem | RailGroup
```

```tsx
export interface AppShellProps {
  theme?: AppTheme
  titleBar?: ReactNode
  rail?: ReactNode
  children?: ReactNode
  className?: string
  style?: CSSProperties
  contentClassName?: string
  contentStyle?: CSSProperties
}
```

```tsx
export interface AppPageProps {
  title?: ReactNode
  description?: ReactNode
  actions?: ReactNode
  children?: ReactNode
  animated?: boolean
  className?: string
  style?: CSSProperties
  contentClassName?: string
  contentStyle?: CSSProperties
}
```

```tsx
export interface AppTitleBarProps {
  title?: ReactNode
  icon?: ReactNode
  actions?: ReactNode
  onMinimize?: () => void
  maximized?: boolean
  onToggleMaximize?: () => void
  onClose?: () => void
  showMinimize?: boolean
  showMaximize?: boolean
  showClose?: boolean
}
```
