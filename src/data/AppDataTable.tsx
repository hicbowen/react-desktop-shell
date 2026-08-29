import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import {
  DataTableFrame,
  DataTableRow,
  useDataTableStickyState,
  useAppDataTable,
  APP_DATA_TABLE_SELECTION_COLUMN_ID,
  isAppDataTableInternalColumn,
  type DataTableActiveCell,
  type DataTableCellNavigation,
} from './internal/dataTableCore'
import { AppDataTableControls } from './AppDataTableControls'
import { AppDataTablePagination } from './AppDataTablePagination'
import type { AppDataTableProps } from './types'
import './AppDataView.css'

const AppDataTableVirtualRows = lazy(
  () => import('./internal/AppDataTableVirtualRows'),
) as typeof import('./internal/AppDataTableVirtualRows').default

export { APP_DATA_TABLE_SELECTION_COLUMN_ID }

function findDataCell(
  root: HTMLElement | null,
  target: DataTableActiveCell,
) {
  if (!root) return null
  return (
    Array.from(
      root.querySelectorAll<HTMLTableCellElement>('td[data-grid-cell="true"]'),
    ).find(
      (cell) =>
        cell.dataset.columnId === target.columnId &&
        cell.closest('tr')?.dataset.rowId === target.rowId,
    ) ?? null
  )
}

export function AppDataTable<TData>(props: AppDataTableProps<TData>) {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const virtualScrollToIndexRef = useRef<((index: number) => void) | null>(null)
  const pendingFocusRef = useRef<DataTableActiveCell | null>(null)
  const [requestedActiveCell, setRequestedActiveCell] =
    useState<DataTableActiveCell | null>(null)
  const core = useAppDataTable(props)
  const stickyState = useDataTableStickyState(
    scrollRef,
    core.table,
    core.stickyLayout,
  )
  const rows = core.table.getRowModel().rows
  const virtualizationEnabled = Boolean(props.virtualization)
  const virtualizationOptions =
    typeof props.virtualization === 'object' ? props.virtualization : {}
  const rowHeight =
    virtualizationOptions.rowHeight ??
    (core.density === 'compact' ? 38 : 48)
  const overscan = virtualizationOptions.overscan ?? 5
  const visibleColumns = core.table.getVisibleLeafColumns()
  const dataColumnIds = useMemo(
    () =>
      visibleColumns
        .filter((column) => !isAppDataTableInternalColumn(column.id))
        .map((column) => column.id),
    [visibleColumns],
  )
  const rowIds = useMemo(() => rows.map((row) => row.id), [rows])
  const activeCell = useMemo<DataTableActiveCell | null>(() => {
    const requestedIsValid =
      requestedActiveCell !== null &&
      rowIds.includes(requestedActiveCell.rowId) &&
      dataColumnIds.includes(requestedActiveCell.columnId)

    if (requestedIsValid) return requestedActiveCell
    const firstRowId = rowIds[0]
    const firstColumnId = dataColumnIds[0]
    return firstRowId && firstColumnId
      ? { rowId: firstRowId, columnId: firstColumnId }
      : null
  }, [dataColumnIds, requestedActiveCell, rowIds])

  const focusCell = useCallback((target: DataTableActiveCell) => {
    const cell = findDataCell(scrollRef.current, target)
    if (!cell) return false
    cell.focus({ preventScroll: true })
    return true
  }, [])

  const scheduleCellFocus = useCallback(
    (target: DataTableActiveCell) => {
      let attempts = 0
      const tryFocus = () => {
        attempts += 1
        if (focusCell(target) || attempts >= 6) {
          if (
            pendingFocusRef.current?.rowId === target.rowId &&
            pendingFocusRef.current.columnId === target.columnId
          ) {
            pendingFocusRef.current = null
          }
          return
        }
        requestAnimationFrame(tryFocus)
      }
      requestAnimationFrame(tryFocus)
    },
    [focusCell],
  )

  useEffect(() => {
    if (!activeCell) return
    const requestedIsValid =
      requestedActiveCell?.rowId === activeCell.rowId &&
      requestedActiveCell.columnId === activeCell.columnId
    if (requestedIsValid) return

    // Keep the roving tab stop valid after filtering, paging, or hiding a column.
    const hadRequestedCell = requestedActiveCell !== null
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRequestedActiveCell(activeCell)
    if (hadRequestedCell && document.activeElement === document.body) {
      scheduleCellFocus(activeCell)
    }
  }, [activeCell, requestedActiveCell, scheduleCellFocus])

  const activateCell = useCallback<DataTableCellNavigation['activateCell']>(
    (rowId, columnId, cell, focus) => {
      setRequestedActiveCell({ rowId, columnId })
      if (focus) cell.focus({ preventScroll: true })
    },
    [],
  )

  const handleCellKeyDown = useCallback(
    (
      rowId: string,
      columnId: string,
      event: KeyboardEvent<HTMLTableCellElement>,
    ) => {
      const rowIndex = rowIds.indexOf(rowId)
      const columnIndex = dataColumnIds.indexOf(columnId)
      if (rowIndex < 0 || columnIndex < 0) return

      let nextRowIndex = rowIndex
      let nextColumnIndex = columnIndex
      switch (event.key) {
        case 'ArrowUp':
          nextRowIndex = Math.max(0, rowIndex - 1)
          break
        case 'ArrowDown':
          nextRowIndex = Math.min(rowIds.length - 1, rowIndex + 1)
          break
        case 'ArrowLeft':
          nextColumnIndex = Math.max(0, columnIndex - 1)
          break
        case 'ArrowRight':
          nextColumnIndex = Math.min(dataColumnIds.length - 1, columnIndex + 1)
          break
        case 'Home':
          if (event.ctrlKey) nextRowIndex = 0
          nextColumnIndex = 0
          break
        case 'End':
          if (event.ctrlKey) nextRowIndex = rowIds.length - 1
          nextColumnIndex = dataColumnIds.length - 1
          break
        default:
          return
      }

      const nextRowId = rowIds[nextRowIndex]
      const nextColumnId = dataColumnIds[nextColumnIndex]
      if (!nextRowId || !nextColumnId) return

      event.preventDefault()
      const target = { rowId: nextRowId, columnId: nextColumnId }
      pendingFocusRef.current = target
      if (virtualizationEnabled) {
        virtualScrollToIndexRef.current?.(nextRowIndex)
      }
      setRequestedActiveCell(target)
      scheduleCellFocus(target)
    },
    [dataColumnIds, rowIds, scheduleCellFocus, virtualizationEnabled],
  )

  const cellNavigation = useMemo<DataTableCellNavigation>(
    () => ({ activeCell, activateCell, onKeyDown: handleCellKeyDown }),
    [activeCell, activateCell, handleCellKeyDown],
  )
  const registerVirtualScrollToIndex = useCallback(
    (handler: ((index: number) => void) | null) => {
      virtualScrollToIndexRef.current = handler
    },
    [],
  )
  const tableState = core.table.getState()
  const controls =
    props.controls &&
    (props.controls.search === true || props.controls.clearAll === true) ? (
      <AppDataTableControls
        options={props.controls}
        table={core.table}
      />
    ) : undefined
  const pagination = core.paginationEnabled ? (
    <AppDataTablePagination
      compact={core.density === 'compact'}
      loading={core.loading}
      options={core.paginationOptions}
      table={core.table}
    />
  ) : undefined
  const normalRows = rows.map((row) => (
    <DataTableRow
      cellNavigation={cellNavigation}
      canSelect={row.getCanSelect()}
      isSelected={row.getIsSelected()}
      isSomeSelected={row.getIsSomeSelected()}
      key={row.id}
      onRowClick={core.onRowClick}
      onRowContextMenu={core.onRowContextMenu}
      row={row}
      selectionMode={core.selectionEnabled ? core.selectionMode : undefined}
      stickyActiveColumnIds={stickyState.activeColumnIds}
      stickyActiveEdgeColumnId={stickyState.activeEdgeColumnId}
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
      filterDefinitions={core.filterDefinitions}
      pagination={pagination}
      scrollRef={scrollRef}
      density={core.density}
      enableColumnResizing={core.enableColumnResizing}
      loading={core.loading}
      maxHeight={core.maxHeight}
      selectionEnabled={core.selectionEnabled}
      selectionMode={core.selectionMode}
      stickyHeader={core.stickyHeader}
      stickyActiveColumnIds={stickyState.activeColumnIds}
      stickyActiveEdgeColumnId={stickyState.activeEdgeColumnId}
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
            cellNavigation={cellNavigation}
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
            registerScrollToIndex={registerVirtualScrollToIndex}
            rows={rows}
            selectionMode={
              core.selectionEnabled ? core.selectionMode : undefined
            }
            scrollRef={scrollRef}
            sorting={tableState.sorting}
            stickyHeader={core.stickyHeader}
            stickyActiveColumnIds={stickyState.activeColumnIds}
            stickyActiveEdgeColumnId={stickyState.activeEdgeColumnId}
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
