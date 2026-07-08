# react-desktop-shell

A lightweight native-like desktop app shell for React, featuring a custom title bar and navigation rail.

## Installation

```bash
npm install react-desktop-shell
```

## Basic Usage

```tsx
import { useState } from 'react'
import { FileText, Home, Settings } from 'lucide-react'

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
  titleBar={<AppTitleBar title="My App" />}
  rail={<AppRail value={active} items={items} onChange={setActive} />}
>
  <HomePage />
</AppShell>
```

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
  --app-shell-content-margin: 0 8px 8px 0;
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

| Variable                      | Default               |
| ----------------------------- | --------------------- |
| `--app-shell-chrome-bg`       | `#f3f3f3`             |
| `--app-shell-content-bg`      | `#f7f8fa`             |
| `--app-shell-content-margin`  | `0 8px 8px 0`         |
| `--app-shell-content-radius`  | `10px`                |
| `--app-shell-content-border-color` | `#e1e1e1`       |
| `--app-page-padding`          | `24px`                |
| `--app-page-header-gap`       | `8px`                 |
| `--app-page-content-gap`      | `24px`                |
| `--app-page-title-size`       | `28px`                |
| `--app-page-title-weight`     | `600`                 |
| `--app-page-text-color`       | `#1f1f1f`             |
| `--app-page-muted-text-color` | `#707070`             |
| `--app-rail-width`            | `228px`               |
| `--app-rail-collapsed-width`  | `56px`                |
| `--app-rail-text-color`       | `#1f1f1f`             |
| `--app-rail-muted-text-color` | `rgba(0, 0, 0, 0.58)` |
| `--app-rail-hover-bg`         | `rgba(0, 0, 0, 0.05)` |
| `--app-rail-accent-color`     | `#115ea3`             |
| `--app-rail-accent-bg`        | `#edf3fb`             |
| `--app-rail-bg`               | `transparent`         |
| `--app-title-bar-height`      | `40px`                |
| `--app-title-bar-text-color`  | `#1f1f1f`             |
| `--app-title-bar-icon-color`  | `#115ea3`             |
| `--app-title-bar-hover-bg`    | `#d4d4d4`             |
| `--app-title-bar-danger-bg`   | `#ef4444`             |
| `--app-title-bar-bg`          | `transparent`         |

## API

### AppShellProps

| Prop                 | Type            | Default     | Description                                      |
| -------------------- | --------------- | ----------- | ------------------------------------------------ |
| `titleBar`           | `ReactNode`     | `undefined` | Title bar content rendered above the body.       |
| `rail`               | `ReactNode`     | `undefined` | Navigation rail content rendered beside content. |
| `children`           | `ReactNode`     | `undefined` | Main content rendered in the scrollable area.    |
| `className`          | `string`        | `undefined` | Additional class name for the root element.      |
| `style`              | `CSSProperties` | `undefined` | Inline styles for the root element.              |
| `contentClassName`   | `string`        | `undefined` | Additional class name for the content element.   |
| `contentStyle`       | `CSSProperties` | `undefined` | Inline styles for the content element.           |

### AppPageProps

| Prop                 | Type            | Default     | Description                                      |
| -------------------- | --------------- | ----------- | ------------------------------------------------ |
| `title`              | `ReactNode`     | `undefined` | Page title rendered in the header.               |
| `description`        | `ReactNode`     | `undefined` | Supporting text rendered below the title.        |
| `actions`            | `ReactNode`     | `undefined` | Page-level actions rendered on the top right.    |
| `children`           | `ReactNode`     | `undefined` | Page content rendered below the header.          |
| `animated`           | `boolean`       | `true`      | Enables the subtle fade-and-rise enter animation. |
| `className`          | `string`        | `undefined` | Additional class name for the root element.      |
| `style`              | `CSSProperties` | `undefined` | Inline styles for the root element.              |
| `contentClassName`   | `string`        | `undefined` | Additional class name for the content element.   |
| `contentStyle`       | `CSSProperties` | `undefined` | Inline styles for the content element.           |

### AppRailProps

| Prop                 | Type                           | Default     | Description                                         |
| -------------------- | ------------------------------ | ----------- | --------------------------------------------------- |
| `value`              | `string`                       | `undefined` | The active item key.                                |
| `items`              | `RailEntry[]`                  | Required    | Main rail entries.                                  |
| `footerItems`        | `RailItem[]`                   | `[]`        | Items pinned to the bottom of the rail.             |
| `onChange`           | `(key: string) => void`        | `undefined` | Called when a navigation item is clicked.           |
| `collapsed`          | `boolean`                      | `undefined` | Controls the collapsed state when provided.         |
| `collapseBreakpoint` | `number`                       | `700`       | Viewport width below which the rail auto-collapses. |
| `onCollapsedChange`  | `(collapsed: boolean) => void` | `undefined` | Called when the uncontrolled auto-collapsed state changes. |
| `className`          | `string`                       | `undefined` | Additional class name for the root element.         |
| `style`              | `CSSProperties`                | `undefined` | Inline styles for the root element.                 |

### AppTitleBarProps

| Prop                 | Type            | Default     | Description                                           |
| -------------------- | --------------- | ----------- | ----------------------------------------------------- |
| `title`              | `ReactNode`     | `undefined` | App title content.                                    |
| `icon`               | `ReactNode`     | `undefined` | App icon content.                                     |
| `actions`            | `ReactNode`     | `undefined` | Custom controls rendered before the window buttons.   |
| `onMinimize`         | `() => void`    | `undefined` | Called when the minimize button is clicked.           |
| `maximized`          | `boolean`       | `false`     | Switches the maximize button into its restore state.  |
| `onToggleMaximize`   | `() => void`    | `undefined` | Called when the maximize or restore button is clicked. |
| `onClose`            | `() => void`    | `undefined` | Called when the close button is clicked.              |
| `showMinimize`       | `boolean`       | `true`      | Shows the minimize button.                            |
| `showMaximize`       | `boolean`       | `true`      | Shows the maximize button.                            |
| `showClose`          | `boolean`       | `true`      | Shows the close button.                               |
| `className`          | `string`        | `undefined` | Additional class name for the root element.           |
| `style`              | `CSSProperties` | `undefined` | Inline styles for the root element.                   |

## Types

```tsx
import type { CSSProperties, ReactNode } from 'react'

export type RailItem = {
  type?: 'item'
  key: string
  label: string
  icon?: ReactNode
}

export type RailGroup = {
  type: 'group'
  label: string
}

export type RailEntry = RailItem | RailGroup
```

```tsx
export interface AppShellProps {
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
