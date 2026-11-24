# Tables, lists, and trees

## Data table recipe

`AppDataTable` is exported from `react-desktop-shell/data`. Confirm that the
consumer has the compatible `@tanstack/react-table` peer dependency declared
by its installed release. Columns use TanStack `ColumnDef<T>` (also exported
as `AppDataTableColumn<T>`), not another UI library's column schema.

Adapted from `example/src/pages/data/DataPages.tsx`. Render under a shell or
provider. Keep columns stable and use durable row IDs when rows can move.

```tsx
import { useState } from 'react'
import type { RowSelectionState, SortingState } from '@tanstack/react-table'
import {
  AppDataTable,
  AppDataView,
  AppSelectionBar,
  type AppDataTableColumn,
} from 'react-desktop-shell/data'
import 'react-desktop-shell/style.css'

type FileRow = { id: string; name: string; status: string }
const columns: AppDataTableColumn<FileRow>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'status', header: 'Status' },
]

export function FilesTable({ rows }: { rows: FileRow[] }) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [selection, setSelection] = useState<RowSelectionState>({})
  const count = Object.values(selection).filter(Boolean).length
  return (
    <AppDataView
      selectionBar={<AppSelectionBar count={count} onClear={() => setSelection({})} />}
    >
      <AppDataTable
        data={rows}
        columns={columns}
        getRowId={(row) => row.id}
        sorting={sorting}
        onSortingChange={setSorting}
        rowSelection={{ value: selection, onChange: setSelection, mode: 'multiple' }}
        controls={{ search: true, clearAll: true }}
        pagination={{ defaultValue: { pageIndex: 0, pageSize: 20 } }}
        emptyContent="No matching files"
      />
    </AppDataView>
  )
}
```

## State and advanced operations

- Table callbacks typed as TanStack `OnChangeFn<T>` may receive either a
  value or updater function. React state setters work directly; custom
  persistence/store adapters must handle both forms.
- `rowSelection` is an options object containing `value` and `onChange`;
  it is not a boolean or an array. `onRowClick` receives a TanStack row;
  application data is at `row.original`.
- `editing.onCommit` receives the row, column ID, previous value, and new
  value. Persist the change and update application-owned `data`; the table
  does not permanently mutate the source records. Handle async errors with
  the editing options and keep the editor's pending/error UI meaningful.
- `treeRows.getSubRows` supplies child rows. `infiniteLoading` supplies
  `hasMore`, `loading`, and `onLoadMore`; fetching and appending rows belong
  to the application.
- `manualSorting` and `manualFiltering` delegate those operations to the
  application. Check the installed pagination API before promising server
  pagination; do not invent `manualPagination` or `rowCount` props.
- Cell selection is separate from row selection. `cellSelection.copy` can
  accept a host clipboard writer; `AppDataTableHandle.copySelectedCells()`
  returns a result with `copied`, `skipped`, or `failed` status.
- `stickyColumns` preserves original order while sticking during scroll;
  column pinning explicitly pins columns. Pinning takes precedence for a
  column configured in both.

## Virtualization and layout

Virtualization needs a bounded scrolling area. For tables use a bounded
`maxHeight` or a properly constrained fill layout; avoid an unconstrained
auto-height page. `AppDataView height="fill"` still needs a bounded parent.

Table virtualization uses fixed row height: defaults are 38px for `compact`
and 48px for `comfortable`. If overriding `rowHeight`, make the rendered row
height match it. Do not promise arbitrary wrapping/variable-height rows with
this fixed-row virtualization API.

List/tree virtualization is also opt-in and fixed-row. Its options include
`viewportHeight`, `overscan`, and respectively `itemHeight` or `rowHeight`.
Use readable `textValue` strings when complex React labels need typeahead.

## List and tree selection are different APIs

`AppListView` and `AppListViewItem` come from `/navigation`, with
`core/style.css` and `navigation/style.css`. Items are children, not a `data`
prop. Even single selection uses a string array.

```tsx
import { useState } from 'react'
import { AppListView, AppListViewItem } from 'react-desktop-shell/navigation'
import 'react-desktop-shell/core/style.css'
import 'react-desktop-shell/navigation/style.css'

export function FileList() {
  const [selected, setSelected] = useState<string[]>([])
  return (
    <AppListView
      ariaLabel="Files"
      selectionMode="single"
      value={selected}
      onValueChange={setSelected}
    >
      <AppListViewItem value="readme" title="README.md" />
      <AppListViewItem value="config" title="Configuration" />
    </AppListView>
  )
}
```

For an action-only list use `activationMode="invoke"` with `onItemInvoke`
and no selection value. Selection and invoke modes are distinct contracts.

`AppTreeView` receives `items` containing `key`, `label`, and optional
`children`. Selection uses `selectedKeys` / `onSelectedKeysChange`; expansion
uses `expandedKeys` / `onExpandedKeysChange`. Both are key arrays. For lazy
nodes use `hasChildren`, `loading`, and `onLoadChildren`, then update the
application's items. `onItemDrop` reports `sourceKey`, `targetKey`, and
`before | inside | after`; the application performs and validates the move.

Related source examples: `example/src/pages/content/ListViewPage.tsx` and
`example/src/pages/content/TreeViewPage.tsx`. Their demo wrappers are not needed.
