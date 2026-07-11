# react-desktop-shell

A lightweight native-like desktop app shell for building React desktop applications.

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
      title="My App"
      sidebar={{
        displayMode: 'auto',
      }}
      titleBar={
        <AppTitleBar
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

`AppShell` composes the sidebar header, title bar, navigation rail, and content area into a full-height desktop shell. The sidebar starts at the top of the window, while the title bar belongs to the main content area.

```tsx
<AppShell
  theme="system"
  title="My App"
  sidebar={{ displayMode: 'auto' }}
  titleBar={<AppTitleBar />}
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

### Side Pane

`AppSidePane` is a contextual pane docked to the right side of `AppPage`. It is suited for detail views, edit forms, properties, and contextual settings. Use `AppDialog` instead for confirmations, destructive decisions, or short modal tasks.

```tsx
const [open, setOpen] = useState(false)
const [paneWidth, setPaneWidth] = useState(380)

<AppPage
  title="Classes"
  sidePane={
    <AppSidePane
      open={open}
      title="Edit class"
      width={paneWidth}
      minWidth={320}
      maxWidth={560}
      resizable
      onWidthChange={setPaneWidth}
      onClose={() => setOpen(false)}
      footer={
        <>
          <button onClick={() => setOpen(false)}>Cancel</button>
          <button onClick={save}>Save</button>
        </>
      }
    >
      <ClassForm />
    </AppSidePane>
  }
>
  <ClassList />
</AppPage>
```

When open, the pane occupies fixed width inside the page and the main content shrinks. It does not render a mask or modal overlay. `width` makes the pane controlled; omit it to use `defaultWidth`. Resizing clamps to `minWidth`, `maxWidth`, and 55% of the available `AppPage` width.

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

## Settings Group and Row

`AppSettingsGroup` and `AppSettingsRow` provide desktop-style setting groups and rows for organizing controls from any UI library. They handle the section surface, separators, labels, descriptions, optional icons, and responsive control placement without owning form state.

```tsx
<AppSettingsGroup
  title="General"
  description="Manage application behavior."
>
  <AppSettingsRow
    title="Theme"
    description="Choose the application appearance."
    control={<ThemeSelect />}
  />

  <AppSettingsRow
    title="Start at login"
    control={<Switch />}
  />
</AppSettingsGroup>
```

These components do not provide controls such as `Switch` or `Select`; pass any React node through `control`. A disabled row only applies disabled text styling and `aria-disabled` to the row. It cannot safely alter an arbitrary control, so disable the actual control as well:

```tsx
<AppSettingsRow
  title="Reminder time"
  disabled={!reminderEnabled}
  control={<Select disabled={!reminderEnabled} />}
/>
```

## App Toolbar

`AppToolbar` is a layout container for desktop application page tools, supporting start, passive status, and end regions.

```tsx
<AppToolbar
  start={<Search />}
  status={<span>12 projects</span>}
  end={<Button>New</Button>}
/>
```

The toolbar does not provide buttons, inputs, selects, or command management. Pass controls from any React component library through `start` and `end`. Use `status` for passive information such as counts, synchronization state, or the current data range. When `children` is provided, it takes precedence over the three named regions and renders as custom toolbar content.

The deprecated `center` prop remains available for compatibility. When both are provided, `status` takes precedence.

`AppPage.actions` places primary page actions beside the page title. `AppToolbar` belongs below the page header and organizes content tools such as search, filters, status, import, and export controls.

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

Rail link items and submenu parents support passive badges for counts and short status text.

```tsx
const items = [
  {
    key: 'activity',
    label: 'Activity',
    icon: <ActivityIcon />,
    badge: 3,
    badgeAriaLabel: '3 unread activities',
  },
]
```

Badges are display-only and are not separate click targets. Use them for numbers or short text such as `New`, not buttons, inputs, or complex interactive content. In a collapsed rail, a badge becomes a small status dot on the icon; submenu flyouts continue to show the full badge. Provide `badgeAriaLabel` for complex or non-text badge content. Child badges are not automatically aggregated onto their submenu parent.

## Groups

Use group entries to separate related navigation items. Group labels are hidden while the rail is collapsed.

```tsx
{
  type: 'group',
  label: 'Workspace',
}
```

## Hierarchical Navigation

Use submenu entries for one level of native-like hierarchy. Submenu parents toggle expansion and do not call `onChange`; submenu children call `onChange(child.key)`.

```tsx
<AppRail
  value={active}
  onChange={setActive}
  items={[
    {
      key: 'home',
      label: 'Home',
      icon: <Home />,
    },
    {
      type: 'submenu',
      key: 'workspace',
      label: 'Workspace',
      icon: <Folder />,
      children: [
        { key: 'files', label: 'Files' },
        { key: 'recent', label: 'Recent' },
      ],
    },
  ]}
/>
```

`AppRail` currently supports one level of submenu nesting. Active children automatically expand their parent when `value` changes. While collapsed, submenu children are shown in a flyout instead of inline.

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

## Pane Display Mode

Prefer `AppShell` for WinUI-style pane display. `displayMode` controls how the Navigation Pane is presented: `expanded` shows the full pane, `compact` shows the icon rail, `minimal` hides the pane until the hamburger opens an overlay, and `auto` resolves from the actual `AppShell` width.

```tsx
<AppShell
  title="FlowGo"
  sidebar={{
    displayMode: 'auto',
    expandedWidth: 316,
    compactWidth: 56,
    expandedBreakpoint: 1008,
    compactBreakpoint: 640,
  }}
  rail={<AppRail value={active} items={items} onChange={setActive} />}
/>
```

`displayMode` and pane open state are separate. `isPaneOpen` only applies to the minimal overlay pane.

```tsx
<AppShell
  sidebar={{
    displayMode,
    onDisplayModeChange: setDisplayMode,
    isPaneOpen,
    onPaneOpenChange: setPaneOpen,
  }}
/>
```

The older `collapsed`, `defaultCollapsed`, and `onCollapsedChange` sidebar options are still supported for compatibility. `collapsed={false}` maps to `expanded`, and `collapsed={true}` maps to `compact`; `displayMode` takes priority when both are supplied.

`AppRail` can still collapse by itself when the viewport width is below `collapseBreakpoint`, which defaults to `700`. Use `onCollapsedChange` to observe uncontrolled auto-collapse changes.

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
  --app-shell-content-margin: 0;
  --app-shell-content-radius: 10px 0 0 0;
}

.app-page {
  --app-page-padding: 20px;
}

.app-rail {
  --app-rail-width: 316px;
  --app-rail-accent-color: #ff4d4f;
}

.app-title-bar {
  --app-title-bar-height: 36px;
}
```

| Variable                           | Default               |
| ---------------------------------- | --------------------- |
| `--app-shell-chrome-bg`            | `#f3f3f3`             |
| `--app-shell-content-bg`           | `#f7f8fa`             |
| `--app-shell-surface-bg`           | `#ffffff`             |
| `--app-shell-text-color`           | `#1f1f1f`             |
| `--app-shell-muted-text-color`     | `#707070`             |
| `--app-shell-disabled-text-color`  | `rgb(0 0 0 / 36%)`   |
| `--app-shell-hover-bg`             | `rgb(0 0 0 / 5%)`     |
| `--app-shell-control-hover-bg`     | `#d4d4d4`             |
| `--app-shell-active-bg`            | `rgb(17 94 163 / 8%)` |
| `--app-shell-border-color`         | `rgb(0 0 0 / 8%)`     |
| `--app-shell-accent-color`         | `#115ea3`             |
| `--app-shell-danger-bg`            | `#ef4444`             |
| `--app-shell-content-margin`       | `0`                   |
| `--app-shell-content-radius`       | `10px 0 0 0`          |
| `--app-shell-content-border-color` | `var(--app-shell-border-color)` |
| `--app-page-padding`               | `20px`                |
| `--app-page-header-gap`            | `8px`                 |
| `--app-page-content-gap`           | `20px`                |
| `--app-page-title-size`            | `26px`                |
| `--app-page-title-weight`          | `600`                 |
| `--app-page-text-color`            | `var(--app-shell-text-color, #1f1f1f)` |
| `--app-page-muted-text-color`      | `var(--app-shell-muted-text-color, #707070)` |
| `--app-rail-width`                 | `316px`               |
| `--app-rail-collapsed-width`       | `56px`                |
| `--app-rail-text-color`            | `var(--app-shell-text-color, #1f1f1f)` |
| `--app-rail-muted-text-color`      | `var(--app-shell-muted-text-color, rgba(0, 0, 0, 0.58))` |
| `--app-rail-hover-bg`              | `var(--app-shell-hover-bg, rgba(0, 0, 0, 0.05))` |
| `--app-rail-accent-color`          | `var(--app-shell-accent-color, #115ea3)` |
| `--app-rail-accent-bg`             | `var(--app-shell-active-bg, rgb(17 94 163 / 8%))` |
| `--app-rail-disabled-text-color`   | `var(--app-shell-disabled-text-color, rgb(0 0 0 / 36%))` |
| `--app-rail-bg`                    | `transparent`         |
| `--app-rail-flyout-bg`             | `var(--app-shell-surface-bg, #ffffff)` |
| `--app-rail-flyout-border-color`   | `var(--app-shell-border-color, rgb(0 0 0 / 10%))` |
| `--app-rail-flyout-shadow`         | `0 8px 24px rgb(0 0 0 / 16%)` |
| `--app-title-bar-height`           | `var(--app-titlebar-height, 36px)` |
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
    {
      key: 'open-with',
      label: 'Open with',
      submenu: [
        { key: 'editor', label: 'Editor', onClick: openEditor },
        { key: 'preview', label: 'Preview', onClick: openPreview },
      ],
    },
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

## Info bar

`AppInfoBar` provides inline persistent feedback for important application states, with semantic statuses, actions, and optional dismissal. It renders directly in the page layout and does not require a provider or global API.

```tsx
<AppInfoBar
  status="warning"
  title="Offline mode"
  message="Some cloud features are currently unavailable."
  action={<button onClick={retry}>Retry</button>}
  dismissible
  onDismiss={handleDismiss}
/>
```

## Dialog

`AppDialog` is a controlled, shell-managed modal dialog. It renders into the shell overlay layer, traps focus while open, restores focus on close, and closes on Escape by default. Overlay clicks do not close the dialog unless opted in.

```tsx
<AppDialog
  open={open}
  onOpenChange={setOpen}
  title="Edit student"
  description="Update this student's profile."
  actions={
    <>
      <button onClick={() => setOpen(false)}>Cancel</button>
      <button onClick={save}>Save</button>
    </>
  }
>
  <StudentForm />
</AppDialog>
```

Use `closeOnEscape={false}` to keep Escape from closing, `closeOnOverlayClick` to opt into overlay-click closing, `initialFocus` to choose the first focused element, and `width` to set the dialog width.

## Message box

`useAppMessageBox` provides a Promise-based command API bound to the current `AppShell`. It reuses the dialog system and queues multiple requests so only one message box is visible at a time.

```tsx
const messageBox = useAppMessageBox()

const confirmed = await messageBox.confirm({
  title: 'Delete student?',
  message: 'This action cannot be undone.',
  confirmText: 'Delete',
  cancelText: 'Cancel',
  danger: true,
})
```

For custom button sets, use `show`.

```tsx
const result = await messageBox.show({
  title: 'Save changes?',
  message: 'The document has unsaved changes.',
  buttons: [
    { key: 'cancel', label: 'Cancel' },
    { key: 'discard', label: 'Discard', danger: true },
    { key: 'save', label: 'Save', primary: true },
  ],
  defaultButton: 'save',
  cancelButton: 'cancel',
})
```

`show` resolves to the clicked button key. Escape resolves to `cancelButton` when one is provided, or `undefined` otherwise. `confirm` resolves to `true` for confirm and `false` for cancel or Escape.

## Toast

`useAppToast` provides short in-app notifications bound to the current `AppShell`. No extra provider is required.

```tsx
const toast = useAppToast()

toast.success('Saved successfully')
```

Use `show` for the full toast shape.

```tsx
toast.show({
  title: 'Student imported',
  message: '100 students were imported.',
  status: 'success',
})
```

Loading toasts default to `duration: 0`, so they stay visible until updated or dismissed. Other statuses default to `4000` milliseconds. Any `duration <= 0` disables auto-dismiss.

```tsx
const id = toast.show({
  title: 'Importing students',
  status: 'loading',
  duration: 0,
})

try {
  await importStudents()

  toast.update(id, {
    title: 'Import complete',
    status: 'success',
    duration: 3000,
  })
} catch {
  toast.update(id, {
    title: 'Import failed',
    status: 'error',
    duration: 5000,
  })
}
```

Toast actions run without automatically dismissing the toast.

```tsx
toast.show({
  title: 'File deleted',
  action: {
    label: 'Undo',
    onClick: restoreFile,
  },
})
```

Pass a stable `id` to update an existing toast instead of stacking duplicates.

```tsx
toast.show({
  id: 'network-status',
  title: 'Network disconnected',
  status: 'error',
})
```

Calling `show` again with the same id updates the existing toast. At most four toasts are visible by default; extra toasts wait in FIFO order and start their duration timer only after becoming visible. Hovering a toast pauses auto-dismiss and resumes with the remaining duration.

## API

### AppShellProps

| Prop               | Type            | Default     | Description                                      |
| ------------------ | --------------- | ----------- | ------------------------------------------------ |
| `theme`            | `'system' \| 'light' \| 'dark'` | `'system'` | Controls the shell color theme. |
| `contextMenu`      | `'native' \| 'app'` | `'native'` | Controls whether native or shell-managed context menus are used. |
| `clipboard`        | `AppClipboardAdapter` | Web Clipboard API | Optional clipboard bridge used by shell-managed menus. |
| `contextMenuLocale` | `Partial<AppContextMenuLocale>` | English labels | Optional labels for built-in context menu items. |
| `messageBoxLocale` | `Partial<AppMessageBoxLocale>` | English labels | Optional default confirm/cancel labels for message boxes. |
| `toastLocale`      | `Partial<AppToastLocale>` | English labels | Optional labels for toast controls. |
| `toastOptions`     | `AppToastHostOptions` | `{ maxVisible: 4 }` | Optional toast host options. |
| `title`            | `ReactNode`     | `undefined` | App title rendered in the default sidebar header. |
| `icon`             | `ReactNode`     | `undefined` | Optional app icon rendered before the sidebar title. |
| `sidebar`          | `AppShellSidebarOptions` | `undefined` | Controls shell-owned sidebar collapse and widths. |
| `sidebarHeader`    | `ReactNode`     | `undefined` | Optional custom sidebar header slot. |
| `titleBar`         | `ReactNode`     | `undefined` | Main-area title bar content. |
| `rail`             | `ReactNode`     | `undefined` | Navigation rail content rendered beside content. |
| `children`         | `ReactNode`     | `undefined` | Main content rendered in the scrollable area.    |
| `className`        | `string`        | `undefined` | Additional class name for the root element.      |
| `style`            | `CSSProperties` | `undefined` | Inline styles for the root element.              |
| `contentClassName` | `string`        | `undefined` | Additional class name for the content element.   |
| `contentStyle`     | `CSSProperties` | `undefined` | Inline styles for the content element.           |

### AppShellSidebarOptions

| Prop                  | Type                           | Default | Description |
| --------------------- | ------------------------------ | ------- | ----------- |
| `displayMode`         | `PaneDisplayMode`              | `undefined` | Controlled pane display mode. |
| `defaultDisplayMode`  | `PaneDisplayMode`              | `'auto'` when `sidebar` is provided | Initial uncontrolled pane display mode. |
| `onDisplayModeChange` | `(mode: PaneDisplayMode) => void` | `undefined` | Called when the pane toggle changes explicit expanded/compact mode. |
| `isPaneOpen`          | `boolean`                      | `undefined` | Controls whether the minimal overlay pane is open. |
| `defaultPaneOpen`     | `boolean`                      | `false` | Initial uncontrolled minimal overlay open state. |
| `onPaneOpenChange`    | `(open: boolean) => void`      | `undefined` | Called when the minimal overlay opens or closes. |
| `expandedWidth`       | `number`                       | `316` | Expanded pane width in pixels. |
| `compactWidth`        | `number`                       | `56` | Compact rail width in pixels. |
| `expandedBreakpoint`  | `number`                       | `1008` | Auto mode width at which the pane resolves to expanded. |
| `compactBreakpoint`   | `number`                       | `640` | Auto mode width at which the pane resolves to compact instead of minimal. |
| `collapsed`           | `boolean`                      | `undefined` | Deprecated compatibility field. Use `displayMode`. |
| `defaultCollapsed`    | `boolean`                      | `undefined` | Deprecated compatibility field. Use `defaultDisplayMode`. |
| `onCollapsedChange`   | `(collapsed: boolean) => void` | `undefined` | Deprecated compatibility callback. Use `onDisplayModeChange`. |

### AppPageProps

| Prop               | Type            | Default     | Description                                       |
| ------------------ | --------------- | ----------- | ------------------------------------------------- |
| `title`            | `ReactNode`     | `undefined` | Page title rendered in the header.                |
| `description`      | `ReactNode`     | `undefined` | Supporting text rendered below the title.         |
| `actions`          | `ReactNode`     | `undefined` | Page-level actions rendered on the top right.     |
| `children`         | `ReactNode`     | `undefined` | Page content rendered below the header.           |
| `sidePane`         | `ReactNode`     | `undefined` | Optional right-side contextual pane.              |
| `animated`         | `boolean`       | `true`      | Enables the subtle fade-and-rise enter animation. |
| `className`        | `string`        | `undefined` | Additional class name for the root element.       |
| `style`            | `CSSProperties` | `undefined` | Inline styles for the root element.               |
| `contentClassName` | `string`        | `undefined` | Additional class name for the content element.    |
| `contentStyle`     | `CSSProperties` | `undefined` | Inline styles for the content element.            |

### AppSettingsGroupProps

| Prop          | Type            | Default     | Description                                  |
| ------------- | --------------- | ----------- | -------------------------------------------- |
| `title`       | `ReactNode`     | `undefined` | Setting group title.                         |
| `description` | `ReactNode`     | `undefined` | Supporting text displayed above the surface. |
| `children`    | `ReactNode`     | Required    | Setting rows or other group content.         |
| `className`   | `string`        | `undefined` | Additional class name for the root section.  |
| `style`       | `CSSProperties` | `undefined` | Inline styles for the root section.          |

### AppSettingsRowProps

| Prop          | Type            | Default     | Description                                       |
| ------------- | --------------- | ----------- | ------------------------------------------------- |
| `title`       | `ReactNode`     | Required    | Setting title.                                    |
| `description` | `ReactNode`     | `undefined` | Optional supporting text.                         |
| `icon`        | `ReactNode`     | `undefined` | Optional decorative icon.                         |
| `control`     | `ReactNode`     | `undefined` | Right-side control or display content.            |
| `disabled`    | `boolean`       | `false`     | Applies disabled row styling and `aria-disabled`. |
| `className`   | `string`        | `undefined` | Additional class name for the row.                |
| `style`       | `CSSProperties` | `undefined` | Inline styles for the row.                        |

### AppToolbarProps

| Prop        | Type        | Default     | Description                                      |
| ----------- | ----------- | ----------- | ------------------------------------------------ |
| `start`     | `ReactNode` | `undefined` | Left region for search and filtering controls.   |
| `status`    | `ReactNode` | `undefined` | Passive information such as counts or state.     |
| `center`    | `ReactNode` | `undefined` | Deprecated compatibility alias for `status`.     |
| `end`       | `ReactNode` | `undefined` | Right region for page tool actions.              |
| `children`  | `ReactNode` | `undefined` | Custom content that overrides the named regions. |
| `className` | `string`    | `undefined` | Additional class name for the toolbar.           |

### AppSidePaneProps

| Prop            | Type                       | Default | Description |
| --------------- | -------------------------- | ------- | ----------- |
| `open`          | `boolean`                  | Required | Controls whether the pane is visible. |
| `title`         | `ReactNode`                | `undefined` | Header title. |
| `children`      | `ReactNode`                | Required | Scrollable pane body content. |
| `width`         | `number`                   | `undefined` | Controlled pane width in pixels. |
| `defaultWidth`  | `number`                   | `380` | Uncontrolled initial width. |
| `minWidth`      | `number`                   | `320` | Minimum width in pixels. |
| `maxWidth`      | `number`                   | `560` | Maximum width before the 55% page constraint. |
| `resizable`     | `boolean`                  | `false` | Enables left-edge pointer resizing. |
| `onWidthChange` | `(width: number) => void`  | `undefined` | Called when the user resizes the pane. |
| `onClose`       | `() => void`               | `undefined` | Shows a close button and handles close clicks. |
| `footer`        | `ReactNode`                | `undefined` | Fixed footer below the scrollable body. |
| `className`     | `string`                   | `undefined` | Additional class name for the root element. |
| `style`         | `CSSProperties`            | `undefined` | Inline styles for the root element. |

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
export type PaneDisplayMode = 'expanded' | 'compact' | 'minimal' | 'auto'

export type RailLinkItem = {
  type?: 'item'
  key: string
  label: string
  icon?: ReactNode
  badge?: ReactNode
  badgeAriaLabel?: string
  disabled?: boolean
}

export type RailItem = RailLinkItem

export type RailSubmenu = {
  type: 'submenu'
  key: string
  label: string
  icon?: ReactNode
  badge?: ReactNode
  badgeAriaLabel?: string
  disabled?: boolean
  children: RailLinkItem[]
}

export type RailGroup = {
  type: 'group'
  label: string
}

export type RailEntry = RailLinkItem | RailSubmenu | RailGroup
```

```tsx
export interface AppShellProps {
  theme?: AppTheme
  title?: ReactNode
  icon?: ReactNode
  sidebar?: AppShellSidebarOptions
  sidebarHeader?: ReactNode
  titleBar?: ReactNode
  rail?: ReactNode
  children?: ReactNode
  className?: string
  style?: CSSProperties
  contentClassName?: string
  contentStyle?: CSSProperties
}

export interface AppShellSidebarOptions {
  collapsible?: boolean
  displayMode?: PaneDisplayMode
  defaultDisplayMode?: PaneDisplayMode
  onDisplayModeChange?: (mode: PaneDisplayMode) => void
  isPaneOpen?: boolean
  defaultPaneOpen?: boolean
  onPaneOpenChange?: (open: boolean) => void
  expandedBreakpoint?: number
  compactBreakpoint?: number
  /**
   * @deprecated Use displayMode instead.
   */
  collapsed?: boolean
  /**
   * @deprecated Use defaultDisplayMode instead.
   */
  defaultCollapsed?: boolean
  /**
   * @deprecated Use onDisplayModeChange instead.
   */
  onCollapsedChange?: (collapsed: boolean) => void
  expandedWidth?: number
  compactWidth?: number
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
