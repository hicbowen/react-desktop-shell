import { useEffect, useRef, type RefObject } from 'react'
import type { Row, SortingState, ColumnFiltersState } from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { AppDataTableProps } from '../types'
import { DataTableRow } from './dataTableCore'

interface AppDataTableVirtualRowsProps<TData> {
  rows: Row<TData>[]
  scrollRef: RefObject<HTMLDivElement | null>
  rowHeight: number
  overscan: number
  visibleColumnCount: number
  stickyHeader: boolean
  onRowClick?: AppDataTableProps<TData>['onRowClick']
  sorting: SortingState
  globalFilter: unknown
  columnFilters: ColumnFiltersState
  pageIndex?: number
  pageSize?: number
  initialViewportHeight?: number
}

function DataTableVirtualSpacerRow({
  height,
  columnCount,
}: {
  height: number
  columnCount: number
}) {
  return (
    <tr aria-hidden="true" className="app-data-table__virtual-spacer">
      <td colSpan={columnCount} style={{ height, padding: 0, border: 0 }} />
    </tr>
  )
}

export default function AppDataTableVirtualRows<TData>({
  rows,
  scrollRef,
  rowHeight,
  overscan,
  visibleColumnCount,
  stickyHeader,
  onRowClick,
  sorting,
  globalFilter,
  columnFilters,
  pageIndex,
  pageSize,
  initialViewportHeight,
}: AppDataTableVirtualRowsProps<TData>) {
  const didMountRef = useRef(false)
  // TanStack Virtual intentionally exposes mutable virtualizer helpers.
  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => rowHeight,
    initialRect: {
      height: initialViewportHeight ?? rowHeight * 10,
      width: 0,
    },
    overscan,
  })
  const virtualItems = virtualizer.getVirtualItems()
  const firstItem = virtualItems[0]
  const lastItem = virtualItems[virtualItems.length - 1]
  const paddingTop = firstItem?.start ?? 0
  const paddingBottom = virtualizer.getTotalSize() - (lastItem?.end ?? 0)

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true
      return
    }
    virtualizer.scrollToIndex(0)
  }, [
    columnFilters,
    globalFilter,
    pageIndex,
    pageSize,
    sorting,
    virtualizer,
  ])

  return (
    <>
      {paddingTop > 0 ? (
        <DataTableVirtualSpacerRow
          columnCount={visibleColumnCount}
          height={paddingTop}
        />
      ) : null}
      {virtualItems.map((virtualRow) => {
        const row = rows[virtualRow.index]
        if (!row) return null

        return (
          <DataTableRow
            key={row.id}
            onRowClick={onRowClick}
            row={row}
            rowHeight={rowHeight}
            stickyHeader={stickyHeader}
          />
        )
      })}
      {paddingBottom > 0 ? (
        <DataTableVirtualSpacerRow
          columnCount={visibleColumnCount}
          height={paddingBottom}
        />
      ) : null}
    </>
  )
}
