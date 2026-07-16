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

## AppSelectorBar

`AppSelectorBar` switches between a small number of mutually exclusive views or
data sets within the current page. Selection is shown with a short Fluent-style
indicator instead of a filled segmented-control surface. It owns selection,
keyboard interaction, and presentation only; it does not own business panels or
silently choose whether those panels remain mounted.

```tsx
<AppSelectorBar
  ariaLabel="Task status"
  defaultValue="all"
  items={[
    { key: 'all', label: 'All' },
    { key: 'open', label: 'Open' },
    { key: 'done', label: 'Completed' },
  ]}
/>
```

Pass `value` and `onChange` for controlled selection. Without `value`, the
component uses `defaultValue`, or the first enabled item when no default is
provided. Removing or disabling the current item selects the first enabled item
and reports that fallback through `onChange`. Controlled mode is recommended
when selection drives application content because it keeps one explicit source
of truth.

```tsx
const [view, setView] = useState('recent')

<AppSelectorBar
  value={view}
  onChange={setView}
  items={[
    { key: 'recent', label: 'Recent', icon: <Clock /> },
    { key: 'favorites', label: 'Favorites', icon: <Heart /> },
    { key: 'history', label: 'History', icon: <History /> },
  ]}
/>
```

Use `AppSelectorPanels` when a selector controls content panels and you want an
explicit mounting policy. The default `unmount` strategy renders only the active
panel:

```tsx
const [view, setView] = useState('recent')

<AppSelectorBar
  value={view}
  onChange={setView}
  items={[
    { key: 'recent', label: 'Recent', panelId: 'recent-panel' },
    { key: 'favorites', label: 'Favorites', panelId: 'favorites-panel' },
  ]}
/>

<AppSelectorPanels value={view} mountStrategy="unmount">
  <AppSelectorPanel id="recent-panel" value="recent">
    <RecentView />
  </AppSelectorPanel>
  <AppSelectorPanel id="favorites-panel" value="favorites">
    <FavoritesView />
  </AppSelectorPanel>
</AppSelectorPanels>
```

With `mountStrategy="unmount"`, switching releases inactive components and
their local state. Use `mountStrategy="hidden"` to keep every panel mounted:

```tsx
<AppSelectorPanels value={view} mountStrategy="hidden">
  <AppSelectorPanel value="recent"><RecentView /></AppSelectorPanel>
  <AppSelectorPanel value="favorites"><FavoritesView /></AppSelectorPanel>
</AppSelectorPanels>
```

Hidden panels use the standard `hidden` attribute, so they do not participate
in layout, focus navigation, or the active accessibility tree. Their React
component instances, subscriptions, and effects still exist, so use this mode
only when preserving local state is worth the retained resources.

The bar uses radiogroup semantics. `ArrowLeft` and `ArrowRight` move through
enabled items and wrap at the ends; `Home` and `End` move to the first and last
enabled items. `Tab` enters only the selected item (or the first enabled item),
and disabled items are skipped.

Choose the component according to the scope of the interaction:

- `AppRail`: application-level primary navigation.
- `AppSelectorBar`: a few view choices within the current page.
- Tabs: multiple documents or distinct content panels, especially when tab
  lifecycle matters.
- Segmented Control: a compact, filled option switch.

`AppSelectorBar` itself is not intended for main navigation, closable or
reorderable tabs, large filter sets, overflow menus, or routing.

## Fluent Cards

## Button primitives

`AppButton` provides standard, primary, subtle, and danger desktop commands in compact or standard sizes. It supports leading or trailing icons, stable loading states, native button attributes, and ref forwarding. Use `AppIconButton` for icon-only commands and always supply `ariaLabel` or `aria-label`; compose tooltips with `AppTooltip`.

```tsx
<AppButton appearance="primary" icon={<Save />} loading={saving}>Save</AppButton>
<AppIconButton ariaLabel="More actions" appearance="subtle" icon={<MoreHorizontal />} />
```

## Fields and empty states

`AppField` supplies label, description or error messaging, required state, and vertical or settings-friendly horizontal layout without controlling its child input. `AppEmptyState` presents a restrained regular or compact empty state with optional icon, description, and action.

```tsx
<AppField id="student-name" label="Student name" description="Used in feedback reports" required error={error}>
  <AppTextBox />
</AppField>
<AppEmptyState title="No students yet" description="Add a student to begin." action={<AppButton>Add student</AppButton>} />
```

RDS inputs consume field associations automatically. For a native or third-party control, provide matching identifiers manually:

```tsx
<AppField htmlFor="external-name" messageId="external-name-help" label="Name" description="Shown in reports">
  <input id="external-name" aria-describedby="external-name-help" />
</AppField>
```

## Progress and status

Use `AppProgressRing` for indeterminate work, `AppProgressBar` for determinate or inline indeterminate progress, and `AppStatusBadge` for one of the fixed semantic statuses. All progress controls expose native ARIA roles and reduced-motion fallbacks.

```tsx
<AppProgressBar value={68} label="Importing students" showValue />
<AppStatusBadge status="success">Complete</AppStatusBadge>
```

## Text inputs

`AppTextBox` wraps native input behavior with optional icons, clear and loading affordances. `AppTextArea` supports character counts and dependency-free automatic height within row limits. Both forward refs and compose with `AppField`.

```tsx
<AppTextBox value={name} onChange={(event) => setName(event.target.value)} clearable />
<AppTextArea autoResize minRows={2} maxRows={8} showCount maxLength={500} />
```

## Selection controls

`AppCheckBox` uses a native checkbox and supports controlled, uncontrolled, and indeterminate states. `AppToggleSwitch` exposes switch semantics, immediate state changes, label placement, and compact sizing.

```tsx
<AppCheckBox checked={selected} onCheckedChange={setSelected} label="Include suggestions" />
<AppToggleSwitch defaultChecked label="Automatic updates" />
```

## Number and select controls

`AppNumberBox` separates temporary editing text from its committed value. Blur and Enter commit valid input, Escape restores the committed value, and buttons or Arrow keys apply normalized steps. In controlled mode, rejected parent updates restore the current prop value. `AppSelect` visually wraps a native single-value select.

```tsx
<AppNumberBox value={duration} min={1} max={180} step={5} onValueChange={setDuration} />
<AppSelect options={courses} value={course} onValueChange={setCourse} />
```

## List view

`AppListView` and `AppListViewItem` form a desktop information list with none, single, or multiple selection, separate invoke behavior, and Arrow/Home/End/Space/Enter keyboard support. Interactive trailing content is isolated from row activation.

```tsx
<AppListView ariaLabel="Students" selectionMode="multiple" value={selected} onValueChange={setSelected}>
  <AppListViewItem value="ada" title="Ada" description="Grade 5 · Python" />
</AppListView>
```

## Expander

`AppExpander` reveals low-frequency settings or details with controlled or uncontrolled state. Its header uses a linked `aria-expanded` button, while optional header actions remain independent.

```tsx
<AppExpander title="Advanced settings" description="Usually no changes are needed.">
  <AdvancedSettings />
</AppExpander>
```

## Popover

`AppPopover` renders lightweight, non-menu supporting content in the overlay portal. It supports controlled or uncontrolled state, anchored placement with collision handling, outside/Escape dismissal, focus restoration, optional initial focus, and trigger-width matching.

```tsx
<AppPopover trigger={<AppButton>View details</AppButton>} placement="bottom-start">
  <AppTextBox placeholder="Optional note" />
</AppPopover>
```

Use `AppTooltip` for short non-interactive descriptions, `AppTeachingTip` for guidance, `AppMenuFlyout` for commands, and `AppDialog` for modal decisions.

`AppCard` is a low-contrast Fluent content surface for desktop tools, settings,
status summaries, recent projects, and utility entry points. It is not a fixed
web-dashboard panel: cards have no strong shadow or title divider by default,
and ordinary cards are static `div` elements without hover or button semantics.

Compose a card from four focused components:

- `AppCard` provides one surface, border, radius, spacing, and optional
  interaction states.
- `AppCardHeader` arranges leading media, title, description, and a trailing
  action. It does not provide a surface or divider.
- `AppCardFooter` arranges supporting information and actions. It is transparent
  and undivided by default.
- `AppCardGroup` merges adjacent `AppCard` borders and corner radii without
  managing selection or other business state.

```tsx
<AppCard>
  <AppCardHeader
    icon={<DatabaseBackup />}
    title="Data backup"
    description="Protect local application data"
    action={<button aria-label="More options">...</button>}
  />
  <div>Last backup: today at 10:30</div>
  <AppCardFooter
    start={<span>24.6 MB</span>}
    end={<button>Back up now</button>}
  />
</AppCard>
```

### Appearance and spacing

`appearance="filled"` is the default and uses the raised content-surface token
with a subtle border. `outlined` keeps the background transparent and relies on
its border. `subtle` starts with a transparent background and border, revealing
a light surface only when interactive. Padding can be `none`, `compact`, or
`regular`; orientation can be `vertical` or `horizontal`.

Horizontal orientation lays out the card's direct children in a row. Keep the
standard Header/content/Footer composition vertical; horizontal mode is intended
for compact custom tool rows where the icon, text, and action are direct children.

### Interaction and selection

Providing `onClick` makes a card interactive by default. Interactive cards use
`role="button"`, enter the Tab order, and activate with Enter or Space. Set
`interactive={false}` to retain a mouse handler without automatic button
semantics or interaction styling. Explicit `interactive={true}` opts into visual,
focus, and button semantics even without an `onClick`; applications should only
do this when they will supply a meaningful activation behavior.

`disabled` blocks mouse and keyboard activation and removes an interactive card
from the Tab order. `selected` is controlled visual state only. Interactive
selected cards expose `aria-pressed`; static selected cards do not acquire a
button, radio, or checkbox role. Buttons, links, inputs, and other interactive
descendants work normally without activating the parent card.

### Footer and groups

When neither `start` nor `end` is supplied, `AppCardFooter` renders `children` as
complete custom content. Once either side is supplied, it uses a three-region
layout: `start`, optional middle `children`, and `end`. The start and middle can
shrink; the end action region does not. `divided` adds a single semantic top
border and should be reserved for content that needs an explicit boundary.

```tsx
<AppCardGroup>
  <AppCard orientation="horizontal">Theme <strong>System</strong></AppCard>
  <AppCard orientation="horizontal">Accent <strong>Blue</strong></AppCard>
  <AppCard orientation="horizontal">Animations <strong>On</strong></AppCard>
</AppCardGroup>
```

`AppCardGroup` defaults to a vertical continuous group with dividers. Horizontal
groups merge left and right corners instead. Non-Card children are rendered but
only direct `AppCard` children receive the complete border-merging treatment.

Cards primarily express Fluent surface hierarchy. Avoid putting every page
element in a card, wrapping every ordinary list row in a separate floating card,
or treating a card as a fixed title-bar container. Use `AppCardGroup` for
continuous setting or property rows. Existing Settings components share the
same card surface and radius tokens but remain purpose-built controls with their
own public API and structure.

## AppScrollArea

`AppScrollArea` is a thin Fluent wrapper around a native scrolling `div`. It
standardizes overflow behavior and scrollbar appearance while preserving the
browser's mouse-wheel, trackpad, touch, keyboard, inertia, and platform-level
scrolling behavior. It does not draw a custom scrollbar or manage scroll state.

The component does not assign a width, height, or flex behavior. Its parent or
the supplied style must create a constrained scrolling region:

```tsx
<AppScrollArea style={{ height: 320 }}>
  <LongSettingsList />
</AppScrollArea>
```

`orientation` controls native overflow:

- `vertical` is the default: vertical overflow is automatic and horizontal
  overflow is hidden.
- `horizontal` enables horizontal overflow and hides vertical overflow.
- `both` enables native overflow in both directions.

`scrollbar` controls scrollbar visibility policy:

- `auto` uses normal native behavior and is the default.
- `always` uses `overflow: scroll` in the enabled direction. Operating systems
  using overlay scrollbars may still choose not to show a permanent track.
- `hidden` hides only the visual scrollbar with standard and WebKit properties;
  wheel, trackpad, touch, keyboard, and programmatic scrolling remain available.

`gutter="stable"` applies `scrollbar-gutter: stable` where supported. It can be
useful for long lists, table-adjacent containers, settings pages, and fixed-layout
dialogs, but is not the default because small panels should not always lose
content width.

```tsx
<AppScrollArea
  aria-label="Release notes"
  gutter="stable"
  orientation="vertical"
  role="region"
  style={{ maxHeight: 240 }}
  tabIndex={0}
>
  <ReleaseNotes />
</AppScrollArea>
```

Scroll areas do not receive `tabIndex` or `role="region"` automatically. Add
`tabIndex={0}` only when users need to focus the scrolling region directly, and
provide an accessible label with it.

The Fluent scrollbar styling is scoped to `AppScrollArea` and explicit internal
library scroll containers; it does not globally affect editors, third-party
popups, form controls, or every element on the page. Do not wrap an existing
scroll container in another `AppScrollArea`, use it as a substitute for virtual
lists, or expect overflow to occur without a constrained size.

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

`@tanstack/react-table` is required when using `AppDataTable`. Vertical row
virtualization is optional and requires one additional peer dependency:

```bash
npm install @tanstack/react-virtual
```

`AppDataView` composes the toolbar or selection bar, table, and optional footer
into one bordered surface. `AppSelectionBar` lays out a selection count and
consumer-provided batch actions without owning selection state. `AppDataTable`
uses TanStack Table's `ColumnDef<TData>` directly.

The data table supports client-side pagination, client or manual sorting, optional built-in global
search and column filter controls, manual/server-side filtering, column
visibility, controlled row selection, loading and empty states, comfortable
and compact density, row activation, horizontal scrolling, and opt-in column sizing. Column sizing
supports controlled or uncontrolled state, mouse and touch resizing, minimum
and maximum widths, per-column resize control, `onEnd` and `onChange` modes,
and double-click reset. Sticky table headers and controlled or uncontrolled
left/right column pinning include pinned boundary shadows and compose with
resizing and visibility. The table does not provide column order dragging.

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
  category: string
  status: string
}

const columns: ColumnDef<Student>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'category', header: 'Category' },
  { accessorKey: 'status', header: 'Status' },
]

function StudentsView({ students }: { students: Student[] }) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const selectedCount = Object.values(rowSelection).filter(Boolean).length

  return (
    <AppDataView
      toolbar={
        <AppToolbar
          appearance="flat"
          status={`${students.length} students`}
        />
      }
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
When pagination is enabled, use `'page'` to select or clear only the current
page; `'filtered'` continues to include matching rows on every page.

`AppDataTable` currently supports flat leaf-column definitions. Multi-level
grouped headers are not currently supported.

### Client-side pagination

Enable the built-in client-side pagination row model with `pagination`. Search
and column filters run against the full data set, sorting runs next, and only
then are the resulting rows split into pages. Pass the complete `data` array;
the application should not call `slice()` before rendering the table.

```tsx
<AppDataTable
  data={students}
  columns={columns}
  pagination={{
    defaultValue: {
      pageIndex: 0,
      pageSize: 10,
    },
    pageSizeOptions: [10, 20, 50],
  }}
/>
```

`pagination={true}` uses a 10-row initial page and the default page-size
choices of 10, 20, and 50. The object form supports uncontrolled state through
`defaultValue`, or controlled state through `value` and `onChange`. Use
`selection.selectAllMode: 'page'` when the header checkbox should affect only
the visible page. This version supports client-side pagination only.

### Vertical row virtualization

For longer continuously scrolling data sets, enable fixed-height vertical row
virtualization inside a constrained scroll area:

```tsx
<AppDataView height="fill">
  <AppDataTable
    data={students}
    columns={columns}
    virtualization={{
      overscan: 5,
    }}
  />
</AppDataView>
```

Virtualization requires `@tanstack/react-virtual` and either a fill-height data
view or an `AppDataTable maxHeight`. It reduces rendered row DOM only: search,
column filtering, and sorting still run against the complete data set. The
default fixed row height follows `density` (48px for comfortable and 38px for
compact). A custom `rowHeight` must match the actual CSS row height.

Only fixed-height vertical row virtualization is supported. Dynamic row
heights and horizontal column virtualization are not supported. For roughly a
few hundred rows, consider pagination first; use virtualization when continuous
scrolling is important. Pagination and virtualization can be enabled together,
but only the current page is virtualized, so the benefit is usually limited.

### Filtering and column visibility

Pass `controls` for the optional built-in search field and unified filter menu.
The search field writes directly to TanStack Table's `globalFilter`. Filter
definitions write directly to `columnFilters`; single filters use one string
value, while multiple filters use a string array. Without `controls`, no
additional control-bar DOM is rendered.

```tsx
const categoryOptions = Array.from(
  new Set(students.map((student) => student.category)),
).map((value) => ({ value, label: value }))

<AppDataTable
  data={students}
  columns={columns}
  controls={{
    search: { placeholder: 'Search students' },
    filters: [
      {
        columnId: 'category',
        label: 'Category',
        options: categoryOptions,
      },
      {
        columnId: 'status',
        label: 'Status',
        mode: 'multiple',
        options: [
          { value: 'Active', label: 'Active' },
          { value: 'Paused', label: 'Paused' },
        ],
      },
    ],
  }}
/>
```

Built-in control text defaults to English. Override only the labels needed by
the current locale through `controls.locale`; dynamic aria labels use formatter
functions. Explicit values in `controls.search` take precedence over locale
search defaults. The combined clear-all button is hidden by default; set
`controls.clearAll` to `true` to show it.

```tsx
<AppDataTable
  data={students}
  columns={columns}
  controls={{
    search: true,
    filters: studentFilters,
    clearAll: true,
    locale: {
      searchPlaceholder: '搜索学生',
      searchAriaLabel: '搜索学生',
      clearSearchAriaLabel: '清除搜索',
      filtersLabel: '筛选',
      activeFiltersAriaLabel: (count) => `筛选，已启用 ${count} 项`,
      clearFilterLabel: '清除',
      clearFilterAriaLabel: (label) => `清除“${label}”筛选`,
      clearFiltersLabel: '清除筛选',
      clearAllLabel: '全部清除',
      clearAllAriaLabel: '清除搜索和所有筛选',
    },
  }}
/>
```

When a filter definition does not provide `filterFn`, single mode compares the
cell value with the selected string and multiple mode checks whether the cell
value is included in the selected string array. A `filterFn` already declared
on the matching `ColumnDef` takes precedence; otherwise a filter definition can
provide its own `filterFn`.

Global filtering supports both TanStack built-in filter names and compatible
custom functions through `globalFilterFn`. Use the existing state props to make
the built-in controls controlled:

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
state changes from its built-in controls but does not filter the rows again.

```tsx
<AppDataTable
  data={serverFilteredData}
  columns={columns}
  columnFilters={columnFilters}
  onColumnFiltersChange={setColumnFilters}
  manualFiltering
/>
```

`AppDataView.toolbar` remains available for advanced application-specific
controls, actions, and status layouts. Using it together with AppDataTable's
built-in `controls` is supported, but produces two control rows; choose one or
both based on the page's needs.

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

### Sticky columns in their original order

Use stable column IDs with `stickyColumns` when a column should retain its
original position and only stick after horizontal scrolling brings it to the
left edge:

```tsx
<AppDataTable
  data={students}
  columns={columns}
  stickyColumns={['category']}
/>
```

Unlike TanStack column pinning, this does not move the column into a left or
right group. Multiple sticky columns accumulate from the left in their current
visible table order, regardless of the order of IDs in `stickyColumns`. Hidden
columns and unknown IDs are ignored. Resizing a sticky column automatically
updates the offsets of sticky columns after it.

`columnPinning` continues to move columns into TanStack's pinned regions and
takes precedence when the same ID also appears in `stickyColumns`. Visible
left-pinned columns occupy the space before original-order sticky columns.

### Row context-menu events

`AppDataTable` reports context-menu events for non-interactive areas of data
rows. Use `useAppContextMenu` inside `AppShell` when those events should open
the shared application menu layer:

```tsx
const contextMenu = useAppContextMenu()

<AppDataTable
  data={rows}
  columns={columns}
  onRowContextMenu={(row, event) => {
    event.preventDefault()

    contextMenu.open({
      x: event.clientX,
      y: event.clientY,
      trigger: event.currentTarget,
      items: [
        {
          key: 'open',
          label: 'Open',
          onClick: () => openRow(row.original),
        },
      ],
    })
  }}
/>
```

`AppDataTable` itself still provides only the event. Call
`event.preventDefault()` when displaying a custom menu. Right-clicking a row
does not select it, and right-clicking an interactive element such as a button,
input, select, or link does not invoke the row callback.

Virtualized rows may be unmounted while scrolling, so do not retain the row
`event.currentTarget`. Store stable data such as `row.id`, `row.original`, and
the mouse `clientX`/`clientY` coordinates instead.

### Fill remaining height

Use `height="fill"` when a data view should occupy its parent's available
height and give the remaining space to the table. The parent must have a
definite height, and intermediate flex children usually need `min-height: 0`
so they can shrink when a toolbar wraps or a selection bar appears.

```tsx
<div style={{ height: '100%', minHeight: 0 }}>
  <AppDataView
    height="fill"
    toolbar={
      <AppToolbar
        appearance="flat"
        status={`${students.length} students`}
      />
    }
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
persistence belong to the application. Column order dragging is a separate
concern.

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
  selectAllMode?: 'all' | 'filtered' | 'page'
  selectAllAriaLabel?: string
  getRowAriaLabel?: (row: Row<TData>) => string
}

export interface AppDataTableSearchOptions {
  placeholder?: string
  ariaLabel?: string
  clearAriaLabel?: string
}

export interface AppDataTableFilterOption {
  value: string
  label: ReactNode
}

export interface AppDataTableFilterDefinition<TData> {
  columnId: string
  label: ReactNode
  options: AppDataTableFilterOption[]
  mode?: 'single' | 'multiple'
  filterFn?: FilterFn<TData>
}

export interface AppDataTableControlsOptions<TData> {
  search?: boolean | AppDataTableSearchOptions
  filters?: AppDataTableFilterDefinition<TData>[]
  clearAll?: boolean
  locale?: Partial<AppDataTableControlsLocale>
}

export interface AppDataTableControlsLocale {
  searchPlaceholder: string
  searchAriaLabel: string
  clearSearchAriaLabel: string
  filtersLabel: string
  activeFiltersAriaLabel: (count: number) => string
  unnamedFilterAriaLabel: (index: number) => string
  clearFilterLabel: string
  clearFilterAriaLabel: (label: string) => string
  clearFiltersLabel: string
  clearAllLabel: string
  clearAllAriaLabel: string
}

export interface AppDataTablePaginationLocale {
  rowsPerPageLabel: string
  rangeLabel: (start: number, end: number, total: number) => string
  pageLabel: (page: number, pageCount: number) => string
  firstPageAriaLabel: string
  previousPageAriaLabel: string
  nextPageAriaLabel: string
  lastPageAriaLabel: string
}

export interface AppDataTablePaginationOptions {
  value?: PaginationState
  defaultValue?: PaginationState
  onChange?: OnChangeFn<PaginationState>
  pageSizeOptions?: number[]
  showPageSizeSelector?: boolean
  showFirstLastButtons?: boolean
  autoResetPageIndex?: boolean
  locale?: Partial<AppDataTablePaginationLocale>
}

export interface AppDataTableVirtualizationOptions {
  /** Defaults to 48 for comfortable density and 38 for compact density. */
  rowHeight?: number
  /** Extra rows rendered before and after the visible range. */
  overscan?: number
}

export interface AppDataTableProps<TData> {
  data: TData[]
  columns: ColumnDef<TData>[]
  controls?: AppDataTableControlsOptions<TData>
  pagination?: boolean | AppDataTablePaginationOptions
  virtualization?: boolean | AppDataTableVirtualizationOptions
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
  stickyColumns?: string[]
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
  onRowContextMenu?: (
    row: Row<TData>,
    event: MouseEvent<HTMLTableRowElement>,
  ) => void
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

Use `layout="fill"` when the page must occupy a constrained parent height and
give its content the remaining space. The default `layout="flow"` keeps the
page at its natural content height.

```tsx
<AppPage layout="fill" title="Students">
  <StudentTable />
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

`AppToolbar` is a lightweight desktop command surface for page tools, supporting start, passive status, and end regions. It uses the bordered `surface` appearance by default. Use `appearance="flat"` when the toolbar is already inside a card, dialog, side pane, or another bordered surface.

```tsx
<AppToolbar
  start={<Search />}
  status={<span>12 projects</span>}
  end={<Button>New</Button>}
/>
```

```tsx
<AppCard>
  <AppToolbar appearance="flat" end={<Button>Save</Button>} />
</AppCard>
```

The toolbar does not provide buttons, inputs, selects, or command management. Pass controls from any React component library through `start` and `end`. Use `status` for passive information such as counts, synchronization state, or the current data range. When `children` is provided, AppToolbar renders custom content mode; `start`, `status`, and `end` are ignored.

`AppPage.actions` places primary page actions beside the page title. `AppToolbar` belongs below the page header and organizes content tools such as search, filters, status, import, and export controls.

## Menu Flyout

`AppMenuFlyout` provides a lightweight, one-level command menu anchored to a
trigger. It defaults to `bottom-start`, automatically flips or clamps near the
viewport edge, and supports icons, disabled commands, danger styling, and
separators.

```tsx
<AppMenuFlyout
  items={[
    { key: 'rename', label: 'Rename' },
    { type: 'separator' },
    { key: 'delete', label: 'Delete', danger: true },
  ]}
  onSelect={(key) => console.log(key)}
>
  <button type="button">More</button>
</AppMenuFlyout>
```

Use `onSelect` to execute the selected command. The menu opens from click,
ArrowDown, or ArrowUp and supports looping arrow navigation, Home, End, Enter,
Space, Escape, and Tab. Selection and Escape restore focus to the trigger;
Tab closes without trapping focus.

Use `AppMenuFlyout` for a button-triggered command list and `AppContextMenu`
for right-click menus. This first version does not support submenus, checkbox
items, radio items, shortcuts, or controlled open state. An empty `items`
array does not open a menu. Tab and Shift+Tab close an open menu without
preventing normal browser focus navigation.

## Split Button

`AppSplitButton` combines a primary command with an `AppMenuFlyout` containing
alternate commands. The left and right sides remain separate Tab stops.

```tsx
<AppSplitButton
  icon={<ExportIcon />}
  label="Export"
  items={[
    { key: 'pdf', label: 'Export PDF' },
    { key: 'image', label: 'Export image' },
  ]}
  onClick={exportDefault}
  onSelect={exportAs}
/>
```

`disabled` disables both sides. Use `menuDisabled` when the primary command
should remain available but alternate choices are temporarily unavailable.
The menu defaults to `bottom-end` and retains all AppMenuFlyout positioning,
dismissal, and keyboard behavior. An empty `items` array automatically disables
the menu side while leaving the primary action available. When `label` is an
icon or another ReactNode without readable text, provide `ariaLabel` explicitly:

```tsx
<AppSplitButton
  ariaLabel="Export"
  label={<ExportIcon />}
  items={exportItems}
/>
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

### Imperative context menus

`useAppContextMenu` opens dynamic menus through the same layer used by
`AppContextMenu`. The Hook must be used within `AppShell`.

```tsx
const contextMenu = useAppContextMenu()

<AppDataTable
  data={rows}
  columns={columns}
  onRowContextMenu={(row, event) => {
    event.preventDefault()

    contextMenu.open({
      x: event.clientX,
      y: event.clientY,
      trigger: event.currentTarget,
      items: [
        {
          key: 'open',
          label: 'Open',
          onClick: () => openRow(row.original),
        },
        { type: 'separator' },
        {
          key: 'delete',
          label: 'Delete',
          danger: true,
          onClick: () => deleteRow(row.original),
        },
      ],
    })
  }}
/>
```

`open()` uses viewport coordinates, so `clientX` and `clientY` are recommended.
Each call captures its current `items` and immediately replaces any open menu;
item callbacks can therefore close over the current business object. The Hook
does not manage row selection. In virtual lists, retain stable data rather than
assuming the trigger DOM will remain mounted.

Explicit imperative menus work with both `contextMenu="app"` and
`contextMenu="native"`; in native mode, call `event.preventDefault()` at the
trigger site. Calling `close()` uses the normal menu focus-restoration path.

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

## Tooltip

`AppTooltip` provides a short, non-interactive description on delayed hover or
keyboard focus. Icon-only triggers still need an accessible name; Tooltip
content supplements `aria-label` rather than replacing it. It defaults to a
`top` placement, a `500ms` hover delay, and a `320px` maximum width; keyboard
focus opens it immediately.

```tsx
<AppTooltip content="Refresh data">
  <button aria-label="Refresh">
    <RefreshIcon />
  </button>
</AppTooltip>
```

Native disabled form controls are wrapped automatically so pointer hover still
works without making the disabled control focusable:

```tsx
<AppTooltip content="Select a row first">
  <button disabled>Delete</button>
</AppTooltip>
```

Placement supports `top`, `bottom`, `left`, and `right`, plus `-start` and
`-end` alignment variants. The final placement may flip when the preferred side
does not have enough room.

```tsx
<AppTooltip content="Aligned help" placement="right-start" maxWidth={240}>
  <button>Details</button>
</AppTooltip>
```

Tooltip content must remain descriptive and non-interactive. Do not place
buttons, links, or inputs inside it; richer interactive guidance belongs in a
future `AppTeachingTip` or `AppPopover`.

## Teaching Tip

`AppTeachingTip` is a controlled, non-modal guidance card anchored to one
element. Unlike Tooltip, it supports a title, longer content, and primary or
secondary actions while remaining open until application state closes it.

```tsx
<AppTeachingTip
  open={showTip}
  onOpenChange={setShowTip}
  title="Batch export"
  content="You can now export multiple records at once."
  closeAriaLabel="关闭"
  primaryAction={{ label: 'Got it', onClick: acknowledgeFeature }}
>
  <button type="button">Export</button>
</AppTeachingTip>
```

TeachingTip does not control the trigger's own open state and only merges
`aria-describedby`; it does not overwrite an existing `aria-expanded` value.
Use `closeAriaLabel` to localize the dismiss button.

The default placement is `right` with a `360px` maximum width. It closes on
Escape, external pointer down, external scroll, resize, window blur, the close
button, or either action. Set `closeOnOutsidePointerDown={false}` for guidance
that should survive outside clicks, or `dismissible={false}` to hide the close
button. TeachingTip does not trap or automatically move focus.

This first version does not provide arrows, spotlight overlays, multi-step
tours, drag behavior, or automatic first-use persistence.

## File Drop Overlay

`AppFileDropOverlay` adds accepting and rejecting feedback while files are
dragged over a local region. It returns standard browser `File[]` values and
does not upload, parse, read, or convert their contents.

```tsx
<AppFileDropOverlay
  accept={['.xlsx', '.csv', 'application/pdf']}
  description="Excel, CSV, or PDF"
  onFiles={handleFiles}
  onReject={(files, reason) => console.warn(reason, files)}
  style={{ height: '100%' }}
>
  <AppPage />
</AppFileDropOverlay>
```

Extension rules are case-insensitive. Exact MIME types and wildcard groups
such as `image/*` are also supported. During protected browser drag events,
file names or MIME types may be unavailable, so the overlay can show a neutral
pending state. Final acceptance always happens on drop using the complete
`File[]`. A batch is rejected when any file fails the accept rules, or when
`multiple={false}` receives more than one file. `onReject` receives the full
batch and either a `type` or `multiple` reason. An empty `accept` list accepts
every file.

With children, the component creates a relative wrapper around the local drop
region. Pass `style={{ width: '100%', height: '100%' }}` when that wrapper must
fill its parent; no full-size dimensions are forced by default. Without
children, place it inside a positioned parent; it listens on that parent
without blocking ordinary interaction while idle. It never adds document-level
drag listeners.

Drag and drop must not be the only import path. Applications should also offer
a keyboard-accessible “Choose file” button. The component does not open a file
picker itself. Wails and Electron integrations receive the same browser File
API surface; native paths, permissions, IPC, and filesystem access remain the
application's responsibility, and an absolute path is not guaranteed.

This first version does not provide upload progress, previews, directory
recursion, size limits, count limits, or per-file partial acceptance.

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
| `layout`           | `'flow' \| 'fill'` | `'flow'` | Uses natural page flow or fills a constrained parent height. |
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
| `appearance` | `'surface' \| 'flat'` | `'surface'` | Adds a lightweight surface or stays transparent inside an existing surface. |
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
  layout?: 'flow' | 'fill'
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
