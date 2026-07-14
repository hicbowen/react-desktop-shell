/* eslint-disable react-refresh/only-export-components */
import {
  useMemo,
  useEffect,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnPinningState,
  type ColumnResizeMode,
  type ColumnSizingState,
  type OnChangeFn,
  type PaginationState,
  type Row,
  type SortingState,
  type Table,
  type VisibilityState,
} from '@tanstack/react-table'
import { DataTableCheckbox } from '../DataTableCheckbox'
import type {
  AppDataTablePaginationOptions,
  AppDataTableProps,
} from '../types'
import { resolveControlFilterColumns } from './dataTableFilters'
import '../../scroll-area/AppScrollArea.css'

export const APP_DATA_TABLE_SELECTION_COLUMN_ID =
  '__app_data_table_selection'

const interactiveSelector = [
  'a',
  'button',
  'input',
  'select',
  'textarea',
  '[contenteditable="true"]',
  '[role="button"]',
  '[role="checkbox"]',
  '[role="link"]',
  '[role="menuitem"]',
  '[role="switch"]',
].join(',')

function isInteractiveTarget(target: EventTarget | null) {
  return target instanceof Element && target.closest(interactiveSelector) != null
}

export interface DataTableStickyLayout {
  offsets: ReadonlyMap<string, number>
  edgeColumnId?: string
}

function createStickyColumnLayout<TData>(
  table: Table<TData>,
  stickyColumns: string[] | undefined,
): DataTableStickyLayout {
  const requestedIds = new Set(stickyColumns ?? [])
  const leftPinnedIds = table.getState().columnPinning.left ?? []
  let offset = leftPinnedIds.reduce((width, columnId) => {
    const column = table.getColumn(columnId)
    return column?.getIsVisible() ? width + column.getSize() : width
  }, 0)
  const offsets = new Map<string, number>()
  let edgeColumnId: string | undefined

  for (const column of table.getVisibleLeafColumns()) {
    if (column.getIsPinned() || !requestedIds.has(column.id)) continue

    offsets.set(column.id, offset)
    offset += column.getSize()
    edgeColumnId = column.id
  }

  return { offsets, edgeColumnId }
}

function getPositionedColumnStyles<TData>(
  column: Column<TData>,
  isHeader: boolean,
  stickyHeader: boolean,
  stickyLayout: DataTableStickyLayout,
): CSSProperties {
  const pinned = column.getIsPinned()
  const stickyLeft = pinned ? undefined : stickyLayout.offsets.get(column.id)
  const sticky = stickyLeft !== undefined

  return {
    position:
      pinned || sticky || (isHeader && stickyHeader)
        ? 'sticky'
        : isHeader
          ? 'relative'
          : undefined,
    left:
      pinned === 'left'
        ? column.getStart('left')
        : sticky
          ? stickyLeft
          : undefined,
    right: pinned === 'right' ? column.getAfter('right') : undefined,
    top: isHeader && stickyHeader ? 0 : undefined,
    width: column.getSize(),
    zIndex: isHeader
      ? stickyHeader
        ? pinned || sticky
          ? 4
          : 3
        : pinned || sticky
          ? 2
          : undefined
      : pinned || sticky
        ? 1
        : undefined,
  }
}

function getPinnedEdge<TData>(column: Column<TData>) {
  const pinned = column.getIsPinned()

  if (pinned === 'left' && column.getIsLastColumn('left')) {
    return 'left'
  }
  if (pinned === 'right' && column.getIsFirstColumn('right')) {
    return 'right'
  }
  return undefined
}

export function useAppDataTable<TData>({
  data,
  columns,
  controls,
  pagination,
  getRowId,
  selection,
  sorting,
  defaultSorting = [],
  onSortingChange,
  manualSorting = false,
  globalFilter,
  defaultGlobalFilter,
  onGlobalFilterChange,
  globalFilterFn,
  columnFilters,
  defaultColumnFilters = [],
  onColumnFiltersChange,
  filterFns,
  manualFiltering = false,
  columnVisibility,
  defaultColumnVisibility = {},
  onColumnVisibilityChange,
  enableColumnResizing = false,
  columnSizing,
  defaultColumnSizing = {},
  onColumnSizingChange,
  columnResizeMode = 'onEnd',
  stickyHeader = false,
  stickyColumns,
  maxHeight,
  enableColumnPinning = true,
  columnPinning,
  defaultColumnPinning = {},
  onColumnPinningChange,
  loading = false,
  loadingContent = 'Loading…',
  emptyContent = 'No data',
  density = 'comfortable',
  onRowClick,
  className,
  style,
}: AppDataTableProps<TData>) {
  const paginationEnabled = Boolean(pagination)
  const paginationOptions: AppDataTablePaginationOptions =
    typeof pagination === 'object' ? pagination : {}
  const [internalSorting, setInternalSorting] = useState<SortingState>(
    () => defaultSorting,
  )
  const [internalGlobalFilter, setInternalGlobalFilter] = useState<unknown>(
    () => defaultGlobalFilter,
  )
  const [internalColumnFilters, setInternalColumnFilters] =
    useState<ColumnFiltersState>(() => defaultColumnFilters)
  const [internalColumnVisibility, setInternalColumnVisibility] =
    useState<VisibilityState>(() => defaultColumnVisibility)
  const [internalColumnSizing, setInternalColumnSizing] =
    useState<ColumnSizingState>(() => defaultColumnSizing)
  const [internalColumnPinning, setInternalColumnPinning] =
    useState<ColumnPinningState>(() => defaultColumnPinning)
  const [internalPagination, setInternalPagination] = useState<PaginationState>(
    () => ({
      pageIndex: 0,
      pageSize: 10,
      ...paginationOptions.defaultValue,
    }),
  )
  const resolvedSorting = sorting ?? internalSorting
  const resolvedGlobalFilter =
    globalFilter !== undefined ? globalFilter : internalGlobalFilter
  const resolvedColumnFilters = columnFilters ?? internalColumnFilters
  const resolvedColumnVisibility = columnVisibility ?? internalColumnVisibility
  const resolvedColumnSizing = columnSizing ?? internalColumnSizing
  const resolvedColumnPinning = columnPinning ?? internalColumnPinning
  const resolvedPagination = paginationOptions.value ?? internalPagination
  const effectiveColumnVisibility = selection
    ? {
        ...resolvedColumnVisibility,
        [APP_DATA_TABLE_SELECTION_COLUMN_ID]: true,
      }
    : resolvedColumnVisibility
  const selectionEnabled = selection !== undefined
  const selectAllMode = selection?.selectAllMode ?? 'filtered'
  const selectAllAriaLabel = selection?.selectAllAriaLabel
  const getRowAriaLabel = selection?.getRowAriaLabel
  const columnsWithControlFilters = useMemo(
    () => resolveControlFilterColumns(columns, controls?.filters ?? []),
    [columns, controls?.filters],
  )
  const getOptionalPaginationRowModel = useMemo(() => {
    const createPaginationRowModel = getPaginationRowModel<TData>()

    return (table: Table<TData>) => {
      const getPaginatedRows = createPaginationRowModel(table)

      return () =>
        (
          table.options.meta as
            | { __appDataTablePaginationEnabled?: boolean }
            | undefined
        )?.__appDataTablePaginationEnabled
          ? getPaginatedRows()
          : table.getPrePaginationRowModel()
    }
  }, [])

  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    if (sorting === undefined) setInternalSorting(updater)
    onSortingChange?.(updater)
  }
  const handleGlobalFilterChange: OnChangeFn<unknown> = (updater) => {
    if (globalFilter === undefined) setInternalGlobalFilter(updater)
    onGlobalFilterChange?.(updater)
  }
  const handleColumnFiltersChange: OnChangeFn<ColumnFiltersState> = (updater) => {
    if (columnFilters === undefined) setInternalColumnFilters(updater)
    onColumnFiltersChange?.(updater)
  }
  const handleColumnVisibilityChange: OnChangeFn<VisibilityState> = (updater) => {
    if (columnVisibility === undefined) setInternalColumnVisibility(updater)
    onColumnVisibilityChange?.(updater)
  }
  const handleColumnSizingChange: OnChangeFn<ColumnSizingState> = (updater) => {
    if (columnSizing === undefined) setInternalColumnSizing(updater)
    onColumnSizingChange?.(updater)
  }
  const handleColumnPinningChange: OnChangeFn<ColumnPinningState> = (updater) => {
    if (columnPinning === undefined) setInternalColumnPinning(updater)
    onColumnPinningChange?.(updater)
  }
  const handlePaginationChange: OnChangeFn<PaginationState> = (updater) => {
    if (paginationOptions.value === undefined) {
      setInternalPagination(updater)
    }
    paginationOptions.onChange?.(updater)
  }

  const resolvedColumns = useMemo<ColumnDef<TData>[]>(() => {
    if (!selectionEnabled) return columnsWithControlFilters

    const selectionColumn: ColumnDef<TData> = {
      id: APP_DATA_TABLE_SELECTION_COLUMN_ID,
      size: 44,
      minSize: 44,
      maxSize: 44,
      enableSorting: false,
      enableHiding: false,
      enableResizing: false,
      enablePinning: true,
      header: ({ table }) => {
        if (selectAllMode === 'all') {
          return (
            <DataTableCheckbox
              aria-label={selectAllAriaLabel ?? 'Select all rows'}
              checked={table.getIsAllRowsSelected()}
              disabled={
                !table.getCoreRowModel().flatRows.some((row) => row.getCanSelect())
              }
              indeterminate={table.getIsSomeRowsSelected()}
              onChange={table.getToggleAllRowsSelectedHandler()}
            />
          )
        }

        const selectionRowModel =
          selectAllMode === 'page'
            ? table.getRowModel()
            : table.getFilteredRowModel()
        const selectableRows = selectionRowModel.flatRows.filter((row) =>
          row.getCanSelect(),
        )
        const selectedRowCount = selectableRows.filter((row) =>
          row.getIsSelected(),
        ).length
        const allSelected =
          selectableRows.length > 0 &&
          selectedRowCount === selectableRows.length

        return (
          <DataTableCheckbox
            aria-label={
              selectAllAriaLabel ??
              (selectAllMode === 'page'
                ? 'Select all rows on this page'
                : 'Select all filtered rows')
            }
            checked={allSelected}
            disabled={selectableRows.length === 0}
            indeterminate={selectedRowCount > 0 && !allSelected}
            onChange={(event) => {
              const shouldSelect = event.currentTarget.checked
              table.setRowSelection((current) => {
                const next = { ...current }
                for (const row of selectableRows) {
                  if (shouldSelect) {
                    next[row.id] = true
                  } else {
                    delete next[row.id]
                  }
                }
                return next
              })
            }}
          />
        )
      },
      cell: ({ row }) => (
        <DataTableCheckbox
          aria-label={getRowAriaLabel?.(row) ?? `Select row ${row.id}`}
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          indeterminate={row.getIsSomeSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
    }
    return [selectionColumn, ...columnsWithControlFilters]
  }, [
    columnsWithControlFilters,
    getRowAriaLabel,
    selectAllAriaLabel,
    selectAllMode,
    selectionEnabled,
  ])

  // TanStack Table intentionally exposes mutable table helpers to its renderer.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns: resolvedColumns,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getOptionalPaginationRowModel,
    manualSorting,
    manualFiltering,
    ...(globalFilterFn !== undefined ? { globalFilterFn } : {}),
    filterFns,
    enableRowSelection: selection?.enableRowSelection,
    enableColumnResizing,
    columnResizeMode,
    enableColumnPinning,
    meta: { __appDataTablePaginationEnabled: paginationEnabled },
    state: {
      sorting: resolvedSorting,
      globalFilter: resolvedGlobalFilter,
      columnFilters: resolvedColumnFilters,
      columnVisibility: effectiveColumnVisibility,
      columnSizing: resolvedColumnSizing,
      columnPinning: resolvedColumnPinning,
      ...(selection ? { rowSelection: selection.value } : {}),
      ...(paginationEnabled ? { pagination: resolvedPagination } : {}),
    },
    onSortingChange: handleSortingChange,
    onGlobalFilterChange: handleGlobalFilterChange,
    onColumnFiltersChange: handleColumnFiltersChange,
    onColumnVisibilityChange: handleColumnVisibilityChange,
    onColumnSizingChange: handleColumnSizingChange,
    onColumnPinningChange: handleColumnPinningChange,
    onRowSelectionChange: selection?.onChange,
    onPaginationChange: handlePaginationChange,
    autoResetPageIndex: paginationOptions.autoResetPageIndex ?? true,
  })
  const stickyLayout = createStickyColumnLayout(table, stickyColumns)

  useEffect(() => {
    if (!paginationEnabled) return

    const pageCount = table.getPageCount()
    const pageIndex = table.getState().pagination.pageIndex
    if (pageCount > 0 && pageIndex >= pageCount) {
      table.setPageIndex(pageCount - 1)
    }
  }, [
    data,
    paginationEnabled,
    resolvedColumnFilters,
    resolvedGlobalFilter,
    resolvedPagination.pageIndex,
    resolvedPagination.pageSize,
    resolvedSorting,
    table,
  ])

  return {
    table,
    visibleColumnCount: table.getVisibleLeafColumns().length,
    density,
    stickyHeader,
    maxHeight,
    enableColumnResizing,
    columnResizeMode,
    loading,
    loadingContent,
    emptyContent,
    onRowClick,
    className,
    style,
    paginationEnabled,
    paginationOptions,
    stickyLayout,
  }
}

interface DataTableHeaderProps<TData> {
  table: Table<TData>
  stickyHeader: boolean
  enableColumnResizing: boolean
  columnResizeMode: ColumnResizeMode
  stickyLayout: DataTableStickyLayout
}

function DataTableHeader<TData>({
  table,
  stickyHeader,
  enableColumnResizing,
  columnResizeMode,
  stickyLayout,
}: DataTableHeaderProps<TData>) {
  return (
    <thead>
      {table.getHeaderGroups().map((headerGroup) => (
        <tr key={headerGroup.id}>
          {headerGroup.headers.map((header) => {
            const sorted = header.column.getIsSorted()
            const canSort = header.column.getCanSort()
            const canResize = enableColumnResizing && header.column.getCanResize()
            const isResizing = header.column.getIsResizing()
            const resizeOffset =
              columnResizeMode === 'onEnd' && isResizing
                ? table.getState().columnSizingInfo.deltaOffset ?? 0
                : 0
            const resizeHandler = header.getResizeHandler()

            return (
              <th
                aria-sort={
                  sorted === 'asc'
                    ? 'ascending'
                    : sorted === 'desc'
                      ? 'descending'
                      : canSort
                        ? 'none'
                        : undefined
                }
                colSpan={header.colSpan}
                data-column-id={header.column.id}
                data-pinned={header.column.getIsPinned() || undefined}
                data-pinned-edge={getPinnedEdge(header.column)}
                data-sticky-column={
                  stickyLayout.offsets.has(header.column.id) || undefined
                }
                data-sticky-edge={
                  stickyLayout.edgeColumnId === header.column.id
                    ? 'left'
                    : undefined
                }
                key={header.id}
                style={getPositionedColumnStyles(
                  header.column,
                  true,
                  stickyHeader,
                  stickyLayout,
                )}
              >
                <div className="app-data-table__header-content">
                  {header.isPlaceholder ? null : canSort ? (
                    <button
                      className="app-data-table__sort-button"
                      type="button"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <span>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      </span>
                      <span aria-hidden="true" className="app-data-table__sort-indicator">
                        {sorted === 'asc' ? '↑' : sorted === 'desc' ? '↓' : ''}
                      </span>
                    </button>
                  ) : (
                    flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )
                  )}
                </div>
                {canResize ? (
                  <div
                    aria-hidden="true"
                    className="app-data-table__resize-handle"
                    data-resizing={isResizing || undefined}
                    style={{ transform: `translateX(${resizeOffset}px)` }}
                    onDoubleClick={(event) => {
                      event.stopPropagation()
                      header.column.resetSize()
                    }}
                    onMouseDown={(event) => {
                      event.stopPropagation()
                      resizeHandler(event)
                    }}
                    onTouchStart={(event) => {
                      event.stopPropagation()
                      resizeHandler(event)
                    }}
                  >
                    <span className="app-data-table__resize-indicator" />
                  </div>
                ) : null}
              </th>
            )
          })}
        </tr>
      ))}
    </thead>
  )
}

interface DataTableFrameProps<TData> {
  table: Table<TData>
  density: 'comfortable' | 'compact'
  stickyHeader: boolean
  maxHeight?: number | string
  enableColumnResizing: boolean
  columnResizeMode: ColumnResizeMode
  loading: boolean
  controls?: ReactNode
  pagination?: ReactNode
  scrollRef?: RefObject<HTMLDivElement | null>
  virtualized?: boolean
  stickyLayout: DataTableStickyLayout
  className?: string
  style?: CSSProperties
  children: ReactNode
}

export function DataTableFrame<TData>({
  table,
  density,
  stickyHeader,
  maxHeight,
  enableColumnResizing,
  columnResizeMode,
  loading,
  controls,
  pagination,
  scrollRef,
  virtualized = false,
  stickyLayout,
  className,
  style,
  children,
}: DataTableFrameProps<TData>) {
  const tableWidth = table.getTotalSize()

  return (
    <div
      className={`app-data-table app-data-table--${density} ${stickyHeader ? 'app-data-table--sticky-header' : ''} ${controls ? 'app-data-table--with-controls' : ''} ${pagination ? 'app-data-table--with-pagination' : ''} ${virtualized ? 'app-data-table--virtualized' : ''} ${className ?? ''}`.trim()}
      style={style}
    >
      {controls}
      <div
        ref={scrollRef}
        className="app-data-table__scroll app-scrollbar"
        style={{ maxHeight }}
      >
        <table
          aria-busy={loading || undefined}
          className="app-data-table__table"
          style={{ width: tableWidth, minWidth: tableWidth }}
        >
          <DataTableHeader
            columnResizeMode={columnResizeMode}
            enableColumnResizing={enableColumnResizing}
            stickyHeader={stickyHeader}
            stickyLayout={stickyLayout}
            table={table}
          />
          <tbody>{children}</tbody>
        </table>
      </div>
      {pagination}
    </div>
  )
}

interface DataTableRowProps<TData> {
  row: Row<TData>
  stickyHeader: boolean
  onRowClick?: AppDataTableProps<TData>['onRowClick']
  rowHeight?: number
  stickyLayout: DataTableStickyLayout
}

export function DataTableRow<TData>({
  row,
  stickyHeader,
  onRowClick,
  rowHeight,
  stickyLayout,
}: DataTableRowProps<TData>) {
  const handleClick = (event: MouseEvent<HTMLTableRowElement>) => {
    if (!onRowClick || isInteractiveTarget(event.target)) return
    onRowClick(row, event)
  }
  const handleKeyDown = (event: KeyboardEvent<HTMLTableRowElement>) => {
    if (event.key !== 'Enter' || !onRowClick || isInteractiveTarget(event.target)) {
      return
    }
    event.preventDefault()
    event.currentTarget.click()
  }

  return (
    <tr
      className={onRowClick ? 'app-data-table__row--clickable' : undefined}
      data-selected={row.getIsSelected() || undefined}
      tabIndex={onRowClick ? 0 : undefined}
      style={rowHeight !== undefined ? { height: rowHeight } : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {row.getVisibleCells().map((cell) => (
        <td
          data-column-id={cell.column.id}
          data-pinned={cell.column.getIsPinned() || undefined}
          data-pinned-edge={getPinnedEdge(cell.column)}
          data-sticky-column={
            stickyLayout.offsets.has(cell.column.id) || undefined
          }
          data-sticky-edge={
            stickyLayout.edgeColumnId === cell.column.id ? 'left' : undefined
          }
          key={cell.id}
          style={getPositionedColumnStyles(
            cell.column,
            false,
            stickyHeader,
            stickyLayout,
          )}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
    </tr>
  )
}

export function DataTableStateRow({
  columnCount,
  content,
}: {
  columnCount: number
  content: ReactNode
}) {
  return (
    <tr className="app-data-table__state-row">
      <td className="app-data-table__state" colSpan={columnCount}>
        {content}
      </td>
    </tr>
  )
}
