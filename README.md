# react-desktop-shell

A lightweight native-like navigation rail component for React, inspired by Fluent UI.

## Installation

```bash
npm install react-desktop-shell
```

## Basic Usage

```tsx
import { useState } from 'react'
import { FileText, Home, Settings } from 'lucide-react'

import { AppRail, AppTitleBar } from 'react-desktop-shell'
import 'react-desktop-shell/style.css'

function App() {
  const [active, setActive] = useState('home')

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppTitleBar
        title="My App"
        onMinimize={handleMinimize}
        onMaximize={handleMaximize}
        onClose={handleClose}
      />

      <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
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
      </div>
    </div>
  )
}
```

## Title Bar

`AppTitleBar` renders the custom title bar UI. Window actions are provided by the host application through callbacks, making it compatible with Wails, Electron, Tauri, or other desktop runtimes.

```tsx
<AppTitleBar
  title="My App"
  icon={<AppIcon />}
  onMinimize={handleMinimize}
  onMaximize={handleMaximize}
  onClose={handleClose}
/>
```

If `onMinimize`, `onMaximize`, or `onClose` are omitted, clicking the matching button is a safe no-op.

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

## Controlled Collapse

`AppRail` automatically collapses when the viewport width is below `collapseBreakpoint`, which defaults to `700`. Pass `collapsed` to fully control the collapsed state.

```tsx
<AppRail
  collapsed={collapsed}
  onCollapsedChange={setCollapsed}
  items={items}
/>
```

## CSS Variables

Override variables on `.app-rail` and `.app-title-bar` to customize the components.

```css
.app-rail {
  --app-rail-width: 240px;
  --app-rail-accent-color: #ff4d4f;
}

.app-title-bar {
  --app-title-bar-height: 44px;
}
```

| Variable | Default |
| --- | --- |
| `--app-rail-width` | `228px` |
| `--app-rail-collapsed-width` | `56px` |
| `--app-rail-text-color` | `#1f1f1f` |
| `--app-rail-muted-text-color` | `rgba(0, 0, 0, 0.58)` |
| `--app-rail-hover-bg` | `rgba(0, 0, 0, 0.05)` |
| `--app-rail-accent-color` | `#115ea3` |
| `--app-rail-accent-bg` | `#edf3fb` |
| `--app-title-bar-height` | `40px` |
| `--app-title-bar-text-color` | `#1f1f1f` |
| `--app-title-bar-icon-color` | `#115ea3` |
| `--app-title-bar-hover-bg` | `#d4d4d4` |
| `--app-title-bar-danger-bg` | `#ef4444` |

## API

### AppRailProps

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | `undefined` | The active item key. |
| `items` | `RailEntry[]` | Required | Main rail entries. |
| `footerItems` | `RailItem[]` | `[]` | Items pinned to the bottom of the rail. |
| `onChange` | `(key: string) => void` | `undefined` | Called when a navigation item is clicked. |
| `collapsed` | `boolean` | `undefined` | Controls the collapsed state when provided. |
| `collapseBreakpoint` | `number` | `700` | Viewport width below which the rail auto-collapses. |
| `onCollapsedChange` | `(collapsed: boolean) => void` | `undefined` | Called when the effective collapsed state changes. |
| `className` | `string` | `undefined` | Additional class name for the root element. |
| `style` | `CSSProperties` | `undefined` | Inline styles for the root element. |

### AppTitleBarProps

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `ReactNode` | `undefined` | App title content. |
| `icon` | `ReactNode` | `undefined` | App icon content. |
| `onMinimize` | `() => void` | `undefined` | Called when the minimize button is clicked. |
| `onMaximize` | `() => void` | `undefined` | Called when the maximize button is clicked. |
| `onClose` | `() => void` | `undefined` | Called when the close button is clicked. |
| `showMinimize` | `boolean` | `true` | Shows the minimize button. |
| `showMaximize` | `boolean` | `true` | Shows the maximize button. |
| `showClose` | `boolean` | `true` | Shows the close button. |
| `className` | `string` | `undefined` | Additional class name for the root element. |
| `style` | `CSSProperties` | `undefined` | Inline styles for the root element. |

## Types

```tsx
import type { ReactNode } from 'react'

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
export interface AppTitleBarProps {
  title?: ReactNode
  icon?: ReactNode
  onMinimize?: () => void
  onMaximize?: () => void
  onClose?: () => void
  showMinimize?: boolean
  showMaximize?: boolean
  showClose?: boolean
}
```
