import {
  forwardRef,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ClipboardEvent,
  type ForwardedRef,
  type KeyboardEvent,
  type ReactElement,
  type RefAttributes,
} from 'react'
import {
  DataTableFrame,
  DataTableRow,
  useDataTableStickyState,
  useAppDataTable,
  APP_DATA_TABLE_ROW_SELECTION_COLUMN_ID,
  isAppDataTableInternalColumn,
  type DataTableActiveCell,
  type DataTableCellNavigation,
} from './internal/dataTableCore'
import { serializeDataTableCellRange } from './internal/dataTableClipboard'
import { isDataTableInteractiveTarget } from './internal/dataTableInteraction'
import { useDataTableCellSelection } from './internal/useDataTableCellSelection'
import { AppDataTableControls } from './AppDataTableControls'
import { AppDataTablePagination } from './AppDataTablePagination'
import type {
  AppDataTableCopyResult,
  AppDataTableCopyWriter,
  AppDataTableHandle,
  AppDataTableProps,
} from './types'
import './AppDataView.css'

const AppDataTableVirtualRows = lazy(
  () => import('./internal/AppDataTableVirtualRows'),
) as typeof import('./internal/AppDataTableVirtualRows').default

export { APP_DATA_TABLE_ROW_SELECTION_COLUMN_ID }

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

/**
 * Writes text for imperative copy commands when the host did not provide a
 * copy function. The Clipboard API is preferred; older browser/WebView runtimes can
 * still expose the native copy command, which routes through this table's
 * standard `copy` event handler.
 */
const defaultDataTableCopyWriter: AppDataTableCopyWriter = async (text) => {
  let clipboardError: unknown
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return
    } catch (error) {
      clipboardError = error
    }
  }

  if (
    typeof document !== 'undefined' &&
    typeof document.execCommand === 'function' &&
    document.execCommand('copy')
  ) {
    return
  }

  throw clipboardError ?? new Error('Clipboard write is unavailable')
}

function reportDataTableCopyError(
  error: unknown,
  onCopyError?: (error: unknown) => void,
) {
  if (onCopyError) {
    onCopyError(error)
    return
  }
  console.error('AppDataTable copy failed', error)
}

function AppDataTableInner<TData>(
  props: AppDataTableProps<TData>,
  ref: ForwardedRef<AppDataTableHandle>,
) {
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
  const tableState = core.table.getState()
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
  const rowIndices = useMemo(
    () => new Map(rowIds.map((rowId, index) => [rowId, index])),
    [rowIds],
  )
  const columnIndices = useMemo(
    () => new Map(dataColumnIds.map((columnId, index) => [columnId, index])),
    [dataColumnIds],
  )
  const activeCell = useMemo<DataTableActiveCell | null>(() => {
    const requestedIsValid =
      requestedActiveCell !== null &&
      rowIndices.has(requestedActiveCell.rowId) &&
      columnIndices.has(requestedActiveCell.columnId)

    if (requestedIsValid) return requestedActiveCell
    const firstRowId = rowIds[0]
    const firstColumnId = dataColumnIds[0]
    return firstRowId && firstColumnId
      ? { rowId: firstRowId, columnId: firstColumnId }
      : null
  }, [columnIndices, dataColumnIds, requestedActiveCell, rowIds, rowIndices])

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

  const activateCellPosition = useCallback(
    (target: DataTableActiveCell, focus: boolean) => {
      setRequestedActiveCell(target)
      if (focus) focusCell(target)
    },
    [focusCell],
  )
  const cellSelection = useDataTableCellSelection({
    options: props.cellSelection,
    rowIds,
    columnIds: dataColumnIds,
    scrollRef,
    activateCell: activateCellPosition,
  })
  const isCellSelectionEnabled = cellSelection.enabled
  const extendCellSelection = cellSelection.extendSelection
  const selectCell = cellSelection.selectCell
  const getCellSelection = cellSelection.getRange
  const copyWriter =
    typeof props.cellSelection === 'object' &&
    typeof props.cellSelection.copy === 'function'
      ? props.cellSelection.copy
      : undefined
  const copyOnCopy =
    typeof props.cellSelection === 'object'
      ? props.cellSelection.onCopy
      : undefined
  const copyOnError =
    typeof props.cellSelection === 'object'
      ? props.cellSelection.onCopyError
      : undefined
  const cellSelectionCopyEnabled =
    typeof props.cellSelection !== 'object' || props.cellSelection.copy !== false

  const copyWriterRef = useRef<AppDataTableCopyWriter | undefined>(copyWriter)
  const copyOnCopyRef = useRef(copyOnCopy)
  const copyOnErrorRef = useRef(copyOnError)
  const writerCopyRef = useRef(false)
  useEffect(() => {
    copyWriterRef.current = copyWriter
    copyOnCopyRef.current = copyOnCopy
    copyOnErrorRef.current = copyOnError
  }, [copyOnCopy, copyOnError, copyWriter])

  const getCopyText = useCallback(
    (range: NonNullable<ReturnType<typeof getCellSelection>>) =>
      serializeDataTableCellRange(
        core.table,
        range,
        rowIds,
        dataColumnIds,
        props.getCellCopyValue,
      ),
    [core.table, dataColumnIds, props.getCellCopyValue, rowIds],
  )

  const runCopyWriter = useCallback(
    async (text: string, writer: AppDataTableCopyWriter) => {
      // A host writer may itself use execCommand('copy'), which dispatches a
      // nested copy event. Suppress the nested success callback so each user
      // action produces one onCopy notification.
      writerCopyRef.current = true
      try {
        await writer(text)
        copyOnCopyRef.current?.(text)
      } finally {
        writerCopyRef.current = false
      }
    },
    [],
  )

  const copySelectedCells = useCallback(async (): Promise<AppDataTableCopyResult> => {
    if (!isCellSelectionEnabled || !cellSelectionCopyEnabled) {
      return { status: 'skipped', reason: 'disabled' }
    }
    const range = getCellSelection()
    if (!range) {
      return { status: 'skipped', reason: 'no-selection' }
    }

    const writer = copyWriterRef.current ?? defaultDataTableCopyWriter
    try {
      // `execCommand('copy')` targets the focused element. Keep the table's
      // active cell focused so the native copy event reaches this surface when
      // the Web Clipboard API is unavailable.
      if (
        writer === defaultDataTableCopyWriter &&
        (typeof navigator === 'undefined' || !navigator.clipboard?.writeText)
      ) {
        focusCell(activeCell ?? range.focus)
      }
      await runCopyWriter(getCopyText(range), writer)
      return { status: 'copied', range }
    } catch (error) {
      reportDataTableCopyError(error, copyOnErrorRef.current)
      return { status: 'failed', error, range }
    }
  }, [
    activeCell,
    cellSelectionCopyEnabled,
    focusCell,
    getCellSelection,
    getCopyText,
    isCellSelectionEnabled,
    runCopyWriter,
  ])

  const handleCopy = useCallback(
    (event: ClipboardEvent<HTMLDivElement>) => {
      if (
        !cellSelection.enabled ||
        isDataTableInteractiveTarget(event.target) ||
        !cellSelectionCopyEnabled
      ) {
        return
      }
      const range = getCellSelection()
      if (!range) return

      const canUseClipboardEvent =
        typeof event.clipboardData?.setData === 'function'

      if (canUseClipboardEvent) {
        const text = getCopyText(range)
        event.preventDefault()
        event.clipboardData.setData('text/plain', text)
        if (!writerCopyRef.current) {
          try {
            copyOnCopyRef.current?.(text)
          } catch (error) {
            reportDataTableCopyError(error, copyOnErrorRef.current)
          }
        }
        return
      }

      const writer = copyWriterRef.current ?? defaultDataTableCopyWriter
      const text = getCopyText(range)
      event.preventDefault()
      void runCopyWriter(text, writer).catch((error) => {
        reportDataTableCopyError(error, copyOnErrorRef.current)
      })
    },
    [
      cellSelection.enabled,
      cellSelectionCopyEnabled,
      getCellSelection,
      getCopyText,
      runCopyWriter,
    ],
  )

  useImperativeHandle(
    ref,
    () => ({
      copySelectedCells,
      getCellSelection,
    }),
    [copySelectedCells, getCellSelection],
  )

  const handleCellKeyDown = useCallback(
    (
      rowId: string,
      columnId: string,
      event: KeyboardEvent<HTMLTableCellElement>,
    ) => {
      const rowIndex = rowIndices.get(rowId)
      const columnIndex = columnIndices.get(columnId)
      if (rowIndex === undefined || columnIndex === undefined) return

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
      if (isCellSelectionEnabled) {
        if (event.shiftKey) {
          extendCellSelection(target, { rowId, columnId })
        } else {
          selectCell(target)
        }
      }
      pendingFocusRef.current = target
      if (virtualizationEnabled) {
        virtualScrollToIndexRef.current?.(nextRowIndex)
      }
      setRequestedActiveCell(target)
      scheduleCellFocus(target)
    },
    [
      columnIndices,
      dataColumnIds,
      extendCellSelection,
      isCellSelectionEnabled,
      rowIds,
      rowIndices,
      scheduleCellFocus,
      selectCell,
      virtualizationEnabled,
    ],
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
      cellSelection={cellSelection}
      canSelect={row.getCanSelect()}
      isSelected={row.getIsSelected()}
      isSomeSelected={row.getIsSomeSelected()}
      key={row.id}
      onRowClick={core.onRowClick}
      onRowContextMenu={core.onRowContextMenu}
      row={row}
      rowSelectionMode={
        core.rowSelectionEnabled ? core.rowSelectionMode : undefined
      }
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
      rowSelectionEnabled={core.rowSelectionEnabled}
      rowSelectionMode={core.rowSelectionMode}
      cellSelectionEnabled={cellSelection.enabled}
      cellSelecting={cellSelection.selecting}
      onCopy={handleCopy}
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
            cellSelection={cellSelection}
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
            rowSelectionMode={
              core.rowSelectionEnabled ? core.rowSelectionMode : undefined
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

export const AppDataTable = forwardRef(AppDataTableInner) as <TData>(
  props: AppDataTableProps<TData> & RefAttributes<AppDataTableHandle>,
) => ReactElement | null
