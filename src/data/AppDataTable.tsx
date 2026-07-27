import { lazy, Suspense, useRef } from 'react'
import {
  DataTableFrame,
  DataTableRow,
  useAppDataTable,
  APP_DATA_TABLE_SELECTION_COLUMN_ID,
} from './internal/dataTableCore'
import { AppDataTableControls } from './AppDataTableControls'
import { AppDataTablePagination } from './AppDataTablePagination'
import type { AppDataTableProps } from './types'
import './AppDataView.css'

const AppDataTableVirtualRows = lazy(
  () => import('./internal/AppDataTableVirtualRows'),
) as typeof import('./internal/AppDataTableVirtualRows').default

export { APP_DATA_TABLE_SELECTION_COLUMN_ID }

export function AppDataTable<TData>(props: AppDataTableProps<TData>) {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const core = useAppDataTable(props)
  const rows = core.table.getRowModel().rows
  const virtualizationEnabled = Boolean(props.virtualization)
  const virtualizationOptions =
    typeof props.virtualization === 'object' ? props.virtualization : {}
  const rowHeight =
    virtualizationOptions.rowHeight ??
    (core.density === 'compact' ? 38 : 48)
  const overscan = virtualizationOptions.overscan ?? 5
  const tableState = core.table.getState()
  const filterDefinitions =
    props.controls?.filters?.filter((definition) =>
      Boolean(core.table.getColumn(definition.columnId)),
    ) ?? []
  const controls =
    props.controls &&
    (Boolean(props.controls.search) || filterDefinitions.length > 0) ? (
      <AppDataTableControls
        filterDefinitions={filterDefinitions}
        options={props.controls}
        table={core.table}
      />
    ) : undefined
  const pagination = core.paginationEnabled ? (
    <AppDataTablePagination
      loading={core.loading}
      options={core.paginationOptions}
      table={core.table}
    />
  ) : undefined
  const normalRows = rows.map((row) => (
    <DataTableRow
      key={row.id}
      onRowClick={core.onRowClick}
      onRowContextMenu={core.onRowContextMenu}
      row={row}
      stickyHeader={core.stickyHeader}
      stickyLayout={core.stickyLayout}
    />
  ))
  const state = core.loading ? 'loading' : rows.length === 0 ? 'empty' : undefined
  const stateContent =
    state === 'loading'
      ? core.loadingContent
      : state === 'empty'
        ? core.emptyContent
        : undefined

  return (
    <DataTableFrame
      className={core.className}
      columnResizeMode={core.columnResizeMode}
      controls={controls}
      pagination={pagination}
      scrollRef={scrollRef}
      density={core.density}
      enableColumnResizing={core.enableColumnResizing}
      loading={core.loading}
      maxHeight={core.maxHeight}
      stickyHeader={core.stickyHeader}
      stickyLayout={core.stickyLayout}
      state={state}
      stateContent={stateContent}
      style={core.style}
      table={core.table}
      virtualized={virtualizationEnabled}
    >
      {state ? null : virtualizationEnabled ? (
        <Suspense fallback={null}>
          <AppDataTableVirtualRows
            columnFilters={tableState.columnFilters}
            globalFilter={tableState.globalFilter}
            initialViewportHeight={
              typeof core.maxHeight === 'number' ? core.maxHeight : undefined
            }
            onRowClick={core.onRowClick}
            onRowContextMenu={core.onRowContextMenu}
            overscan={overscan}
            pageIndex={
              core.paginationEnabled
                ? tableState.pagination.pageIndex
                : undefined
            }
            pageSize={
              core.paginationEnabled
                ? tableState.pagination.pageSize
                : undefined
            }
            rowHeight={rowHeight}
            rows={rows}
            scrollRef={scrollRef}
            sorting={tableState.sorting}
            stickyHeader={core.stickyHeader}
            stickyLayout={core.stickyLayout}
            visibleColumnCount={core.visibleColumnCount}
          />
        </Suspense>
      ) : (
        normalRows
      )}
    </DataTableFrame>
  )
}
