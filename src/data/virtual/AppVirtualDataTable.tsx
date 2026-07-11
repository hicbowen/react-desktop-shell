import {
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
} from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import {
  DataTableFrame,
  DataTableRow,
  DataTableStateRow,
  DataTableVirtualSpacerRow,
  useAppDataTable,
} from '../internal/dataTableCore.tsx'
import type { AppVirtualDataTableProps } from './types'

type VirtualTableStyle = CSSProperties & {
  '--app-data-table-virtual-row-height': string
}

export function AppVirtualDataTable<TData>({
  estimatedRowHeight,
  overscan = 8,
  ...tableProps
}: AppVirtualDataTableProps<TData>) {
  const core = useAppDataTable(tableProps)
  const rows = core.table.getRowModel().rows
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const resolvedRowHeight =
    estimatedRowHeight ?? (core.density === 'compact' ? 38 : 48)
  const getItemKey = useCallback(
    (index: number) => rows[index]?.id ?? index,
    [rows],
  )

  // React Virtual intentionally exposes mutable virtualizer helpers.
  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: core.loading ? 0 : rows.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => resolvedRowHeight,
    overscan,
    getItemKey,
  })

  useEffect(() => {
    rowVirtualizer.measure()
  }, [resolvedRowHeight, rowVirtualizer])

  const virtualItems = rowVirtualizer.getVirtualItems()
  const firstVirtualItem = virtualItems[0]
  const lastVirtualItem = virtualItems[virtualItems.length - 1]
  const paddingTop = firstVirtualItem?.start ?? 0
  const paddingBottom = lastVirtualItem
    ? rowVirtualizer.getTotalSize() - lastVirtualItem.end
    : 0
  const headerGroupCount = core.table.getHeaderGroups().length
  const virtualStyle: VirtualTableStyle = {
    ...core.style,
    '--app-data-table-virtual-row-height': `${resolvedRowHeight}px`,
  }

  return (
    <DataTableFrame
      ariaRowCount={
        !core.loading && rows.length > 0
          ? rows.length + headerGroupCount
          : undefined
      }
      className={core.className}
      columnResizeMode={core.columnResizeMode}
      density={core.density}
      enableColumnResizing={core.enableColumnResizing}
      loading={core.loading}
      maxHeight={core.maxHeight}
      scrollRef={scrollContainerRef}
      stickyHeader={core.stickyHeader}
      style={virtualStyle}
      table={core.table}
      virtualized
    >
      {core.loading ? (
        <DataTableStateRow
          columnCount={core.visibleColumnCount}
          content={core.loadingContent}
        />
      ) : rows.length === 0 ? (
        <DataTableStateRow
          columnCount={core.visibleColumnCount}
          content={core.emptyContent}
        />
      ) : (
        <>
          <DataTableVirtualSpacerRow
            columnCount={core.visibleColumnCount}
            height={paddingTop}
          />
          {virtualItems.map((virtualItem) => {
            const row = rows[virtualItem.index]
            return row ? (
              <DataTableRow
                ariaRowIndex={virtualItem.index + headerGroupCount + 1}
                key={row.id}
                onRowClick={core.onRowClick}
                row={row}
                stickyHeader={core.stickyHeader}
              />
            ) : null
          })}
          <DataTableVirtualSpacerRow
            columnCount={core.visibleColumnCount}
            height={paddingBottom}
          />
        </>
      )}
    </DataTableFrame>
  )
}
