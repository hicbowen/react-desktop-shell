# react-desktop-shell

A lightweight native-like desktop app shell for building React desktop applications.

## Installation

```bash
npm install react-desktop-shell
```

The basic example uses `lucide-react` for icons. Install it separately with
`npm install lucide-react`, or replace those icons with your preferred icon
library. Lucide is not required by `react-desktop-shell`.

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

## Optional Ant Design Integration

Ant Design support is an optional theme preset. Normal `react-desktop-shell` usage does not require AntD; install it only when importing the `/antd` entry point.

```bash
npm install react-desktop-shell antd
```

The preset configures global Ant Design tokens without wrapping AntD components or adding component-specific overrides.

```tsx
import { ConfigProvider } from 'antd'
import { createAntdTheme } from 'react-desktop-shell/antd'

const themeConfig = createAntdTheme({
  mode: 'dark',
})

<ConfigProvider theme={themeConfig}>
  <AppShell theme="dark">
    <App />
  </AppShell>
</ConfigProvider>
```

`createAntdTheme` accepts only resolved `light` or `dark` modes. Applications using the shell's `system` mode should resolve the operating-system preference in application state before creating the AntD theme; the preset does not access browser APIs or manage theme state.

Override any global token when creating the preset:

```tsx
createAntdTheme({
  mode: 'light',
  token: {
    colorPrimary: '#7c5cff',
    borderRadius: 8,
  },
})
```

Component-level Ant Design customization remains the consumer's responsibility. Extend the returned config when a particular component needs additional tuning:

```tsx
const baseTheme = createAntdTheme({ mode: 'light' })

const themeConfig = {
  ...baseTheme,
  components: {
    Table: {
      cellPaddingBlock: 8,
    },
  },
}
```

## Optional Data View

Data-view components are available from the optional `react-desktop-shell/data`
subpath. Install TanStack Table alongside the shell when you use this entry:

```bash
npm install react-desktop-shell @tanstack/react-table
```

`AppDataView` composes the toolbar or selection bar, table, and optional footer
into one bordered surface. `AppSelectionBar` lays out a selection count and
consumer-provided batch actions without owning selection state. `AppDataTable`
uses TanStack Table's `ColumnDef<TData>` directly.

The data table supports client or manual sorting, global filtering, column
filtering, manual/server-side filtering, column visibility, controlled row
selection, loading and empty states, comfortable and compact density, row
activation, horizontal scrolling, and opt-in column sizing. Column sizing
supports controlled or uncontrolled state, mouse and touch resizing, minimum
and maximum widths, per-column resize control, `onEnd` and `onChange` modes,
and double-click reset. Sticky table headers and controlled or uncontrolled
left/right column pinning include pinned boundary shadows and compose with
resizing and visibility. The table does not provide filtering controls,
pagination, or column order dragging.

```tsx
import { useState } from 'react'
import type { ColumnDef, RowSelectionState } from '@tanstack/react-table'

import { AppToolbar } from 'react-desktop-shell'
import {
  AppDataTable,
  AppDataView,
  AppSelectionBar,
} from 'react-desktop-shell/data'

type Student = {
  id: string
  name: string
}

const columns: ColumnDef<Student>[] = [
  { accessorKey: 'name', header: 'Name' },
]

function StudentsView({ students }: { students: Student[] }) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const selectedCount = Object.values(rowSelection).filter(Boolean).length

  return (
    <AppDataView
      toolbar={<AppToolbar status={`${students.length} students`} />}
      selectionBar={
        selectedCount > 0 ? (
          <AppSelectionBar
            count={selectedCount}
            onClear={() => setRowSelection({})}
          />
        ) : null
      }
      footer={`Showing ${students.length} students`}
    >
      <AppDataTable
        columns={columns}
        data={students}
        getRowId={(student) => student.id}
        selection={{
          value: rowSelection,
          onChange: setRowSelection,
          selectAllMode: 'filtered',
        }}
      />
    </AppDataView>
  )
}
```

Provide a stable `getRowId` when enabling row selection, sorting, or filtering.
The table never adds fields to or mutates input data.

`selection.selectAllMode` defaults to `'filtered'`. In this mode the header
checkbox selects or clears only selectable rows in the current filtered result.
Use `'all'` to make it operate on all data rows instead. Changing filters does
not automatically clear already selected rows outside the filtered result.

`AppDataTable` currently supports flat leaf-column definitions. Multi-level
grouped headers are not currently supported.

### Filtering and column visibility

`AppDataTable` accepts TanStack Table state but does not render a search input,
filter Select, or column settings menu. Put those controls in `AppToolbar` and
pass their state into the table.

Global filtering supports both TanStack built-in filter names and compatible
custom functions through `globalFilterFn`:

```tsx
const [globalFilter, setGlobalFilter] = useState('')

<AppDataTable
  data={students}
  columns={columns}
  globalFilter={globalFilter}
  onGlobalFilterChange={setGlobalFilter}
/>
```

Column filters target stable column IDs. Custom named filter functions can be
registered with `filterFns` and referenced by each `ColumnDef.filterFn`.

```tsx
import type { ColumnFiltersState } from '@tanstack/react-table'

const [columnFilters, setColumnFilters] =
  useState<ColumnFiltersState>([])

<AppDataTable
  data={students}
  columns={columns}
  columnFilters={columnFilters}
  onColumnFiltersChange={setColumnFilters}
/>
```

Column visibility uses TanStack column IDs. A column with
`enableHiding: false` should not be offered by the toolbar's column menu. The
internal selection column is always protected from hiding.

```tsx
import type { VisibilityState } from '@tanstack/react-table'

const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
  lastActivity: false,
})

<AppDataTable
  data={students}
  columns={columns}
  columnVisibility={columnVisibility}
  onColumnVisibilityChange={setColumnVisibility}
/>
```

Hidden columns retain their sorting and filtering state. Changing a filter also
does not clear row selection. For server-side filtering, provide already
filtered data and enable `manualFiltering`; the component still reports filter
state changes but does not filter the rows again.

```tsx
<AppDataTable
  data={serverFilteredData}
  columns={columns}
  columnFilters={columnFilters}
  onColumnFiltersChange={setColumnFilters}
  manualFiltering
/>
```

### Column sizing

Column dimensions use TanStack Table's native `ColumnDef` fields. Set `size`,
`minSize`, and `maxSize` on each column, and use `enableResizing: false` for a
column that must remain fixed. Resizing is disabled by default and uses the
`onEnd` mode when enabled; `onEnd` avoids committing high-frequency width
updates while the pointer is moving.

```tsx
const columns: ColumnDef<Student>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    size: 220,
    minSize: 140,
    maxSize: 400,
  },
  {
    id: 'actions',
    header: 'Actions',
    size: 100,
    minSize: 100,
    maxSize: 100,
    enableResizing: false,
  },
]

<AppDataTable
  data={students}
  columns={columns}
  enableColumnResizing
/>
```

Pass `columnSizing` for controlled sizing, or use `defaultColumnSizing` for an
uncontrolled initial value. Dragging supports mouse and touch input. Double-click
a resize handle to restore that column's `ColumnDef.size` without changing other
table state.

```tsx
import type {
  ColumnResizeMode,
  ColumnSizingState,
} from '@tanstack/react-table'

const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({})
const [resizeMode, setResizeMode] = useState<ColumnResizeMode>('onEnd')

<AppDataTable
  data={students}
  columns={columns}
  enableColumnResizing
  columnSizing={columnSizing}
  onColumnSizingChange={setColumnSizing}
  columnResizeMode={resizeMode}
/>
```

Column visibility and sizing remain independent, so hiding and showing a column
does not discard its stored size. Persisting `columnSizing` is the application's
responsibility; the component does not read from or write to `localStorage`.

`AppDataTable` respects the exact TanStack column sizes. When the total column
width is smaller than the container, unused space remains as table surface
instead of stretching columns.

### Sticky header and column pinning

Sticky headers remain inside the AppDataTable scroll container. Pass a numeric
or CSS `maxHeight` to create vertical scrolling within that same container;
horizontal header and body scrolling therefore stay synchronized without
JavaScript scroll listeners.

```tsx
<AppDataTable
  data={students}
  columns={columns}
  stickyHeader
  maxHeight={480}
/>
```

### Fill remaining height

Use `height="fill"` when a data view should occupy its parent's available
height and give the remaining space to the table. The parent must have a
definite height, and intermediate flex children usually need `min-height: 0`
so they can shrink when a toolbar wraps or a selection bar appears.

```tsx
<div style={{ height: '100%', minHeight: 0 }}>
  <AppDataView
    height="fill"
    toolbar={<AppToolbar status={`${students.length} students`} />}
    selectionBar={
      selectedCount > 0 ? (
        <AppSelectionBar
          count={selectedCount}
          onClear={() => setRowSelection({})}
        />
      ) : null
    }
  >
    <AppDataTable
      data={students}
      columns={columns}
      stickyHeader
    />
  </AppDataView>
</div>
```

The table's existing `.app-data-table__scroll` element remains the only
vertical and horizontal scroll container. `height="fill"` does not read or
derive the window height. If `maxHeight` is also provided, it remains an upper
bound on that internal scroll area. Pages that do not have a definite parent
height should keep the default `height="auto"` behavior.

Column pinning uses stable TanStack column IDs. Offsets are derived from the
current column sizes, so resizing a pinned column immediately updates the pinned
layout. Boundary shadows mark only the last left-pinned and first right-pinned
columns.

```tsx
import type { ColumnPinningState } from '@tanstack/react-table'

const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
  left: ['name'],
  right: ['actions'],
})

<AppDataTable
  data={students}
  columns={columns}
  columnPinning={columnPinning}
  onColumnPinningChange={setColumnPinning}
/>
```

Use the exported stable ID to pin the optional internal selection column without
guessing implementation details:

```tsx
import {
  APP_DATA_TABLE_SELECTION_COLUMN_ID,
} from 'react-desktop-shell/data'

<AppDataTable
  data={students}
  columns={columns}
  selection={selection}
  defaultColumnPinning={{
    left: [APP_DATA_TABLE_SELECTION_COLUMN_ID, 'name'],
  }}
/>
```

Hiding a pinned column does not remove its ID from `columnPinning`; showing it
again restores the pinned position and existing size. Pinning menus and state
persistence belong to the application. Column order dragging and pagination
are separate concerns.

### Data view API

```tsx
export interface AppDataViewProps {
  height?: 'auto' | 'fill'
  toolbar?: ReactNode
  selectionBar?: ReactNode
  footer?: ReactNode
  children: ReactNode
  className?: string
  style?: CSSProperties
}

export interface AppSelectionBarProps {
  count: number
  label?: ReactNode
  actions?: ReactNode
  onClear?: () => void
  clearAriaLabel?: string
  className?: string
  style?: CSSProperties
}

export interface AppDataTableSelectionOptions<TData> {
  value: RowSelectionState
  onChange: OnChangeFn<RowSelectionState>
  enableRowSelection?: TableOptions<TData>['enableRowSelection']
  selectAllMode?: 'all' | 'filtered'
  selectAllAriaLabel?: string
  getRowAriaLabel?: (row: Row<TData>) => string
}

export interface AppDataTableProps<TData> {
  data: TData[]
  columns: ColumnDef<TData>[]
  getRowId?: TableOptions<TData>['getRowId']
  selection?: AppDataTableSelectionOptions<TData>
  sorting?: SortingState
  defaultSorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  manualSorting?: boolean
  globalFilter?: unknown
  defaultGlobalFilter?: unknown
  onGlobalFilterChange?: OnChangeFn<unknown>
  globalFilterFn?: TableOptions<TData>['globalFilterFn']
  columnFilters?: ColumnFiltersState
  defaultColumnFilters?: ColumnFiltersState
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>
  filterFns?: TableOptions<TData>['filterFns']
  manualFiltering?: boolean
  columnVisibility?: VisibilityState
  defaultColumnVisibility?: VisibilityState
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>
  enableColumnResizing?: boolean
  columnSizing?: ColumnSizingState
  defaultColumnSizing?: ColumnSizingState
  onColumnSizingChange?: OnChangeFn<ColumnSizingState>
  columnResizeMode?: ColumnResizeMode
  stickyHeader?: boolean
  maxHeight?: number | string
  enableColumnPinning?: TableOptions<TData>['enableColumnPinning']
  columnPinning?: ColumnPinningState
  defaultColumnPinning?: ColumnPinningState
  onColumnPinningChange?: OnChangeFn<ColumnPinningState>
  loading?: boolean
  loadingContent?: ReactNode
  emptyContent?: ReactNode
  density?: 'comfortable' | 'compact'
  onRowClick?: (row: Row<TData>, event: MouseEvent<HTMLTableRowElement>) => void
  className?: string
  style?: CSSProperties
}
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
