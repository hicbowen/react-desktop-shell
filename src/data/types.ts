import type { CSSProperties, MouseEvent, ReactNode } from 'react'
import type {
  ColumnDef,
  Cell,
  ColumnFiltersState,
  ColumnPinningState,
  ColumnResizeMode,
  ColumnSizingState,
  FilterFn,
  OnChangeFn,
  PaginationState,
  Row,
  RowSelectionState,
  SortingState,
  TableOptions,
  VisibilityState,
} from '@tanstack/react-table'

export type AppDataTableColumn<TData> = ColumnDef<TData>

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
  /** Render the global row search field above the table. */
  search?: boolean
  /** Render each definition in the matching column's menu. */
  filters?: AppDataTableFilterDefinition<TData>[]
  /** Show a button that clears both search and filters. Defaults to false. */
  clearAll?: boolean
}

export interface AppDataTablePaginationOptions {
  value?: PaginationState
  defaultValue?: PaginationState
  onChange?: OnChangeFn<PaginationState>
  pageSizeOptions?: number[]
  showPageSizeSelector?: boolean
  showFirstLastButtons?: boolean
  autoResetPageIndex?: boolean
}

export interface AppDataTableVirtualizationOptions {
  /**
   * Fixed rendered row height in pixels.
   *
   * Defaults to 38 for compact density and 48 for comfortable density.
   */
  rowHeight?: number
  /** Number of extra rows rendered before and after the visible area. */
  overscan?: number
}

export interface AppDataTableRowSelectionOptions<TData> {
  value: RowSelectionState
  onChange: OnChangeFn<RowSelectionState>
  enableRowSelection?: TableOptions<TData>['enableRowSelection']
  /** Single uses a narrow accent-indicator column; multiple uses a wider checkbox column. Defaults to multiple. */
  mode?: 'single' | 'multiple'
  selectAllMode?: 'all' | 'filtered' | 'page'
}

export interface AppDataTableCellPosition {
  rowId: string
  columnId: string
}

export interface AppDataTableCellRange {
  anchor: AppDataTableCellPosition
  focus: AppDataTableCellPosition
}

export interface AppDataTableCellSelectionOptions {
  copy?: boolean
  value?: AppDataTableCellRange | null
  onChange?: (range: AppDataTableCellRange | null) => void
}

export interface AppDataTableProps<TData> {
  data: TData[]
  /**
   * Flat leaf-column definitions.
   *
   * Multi-level grouped headers are not currently supported.
   */
  columns: ColumnDef<TData>[]
  controls?: AppDataTableControlsOptions<TData>
  pagination?: boolean | AppDataTablePaginationOptions
  virtualization?: boolean | AppDataTableVirtualizationOptions
  getRowId?: TableOptions<TData>['getRowId']
  rowSelection?: AppDataTableRowSelectionOptions<TData>
  cellSelection?: boolean | AppDataTableCellSelectionOptions
  getCellCopyValue?: (cell: Cell<TData, unknown>) => string
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
  /**
   * Columns that retain their original order and stick to the left edge
   * when horizontal scrolling reaches them.
   *
   * Column pinning takes precedence when the same column is configured
   * in both APIs.
   */
  stickyColumns?: string[]
  maxHeight?: number | string
  enableColumnPinning?: TableOptions<TData>['enableColumnPinning']
  columnPinning?: ColumnPinningState
  defaultColumnPinning?: ColumnPinningState
  onColumnPinningChange?: OnChangeFn<ColumnPinningState>
  loading?: boolean
  loadingContent?: ReactNode
  emptyContent?: ReactNode
  /** Visual density. Defaults to compact. */
  density?: 'comfortable' | 'compact'
  onRowClick?: (row: Row<TData>, event: MouseEvent<HTMLTableRowElement>) => void
  /**
   * Called when the user opens the context menu on a non-interactive
   * area of a data row.
   *
   * Call event.preventDefault() when displaying a custom context menu.
   */
  onRowContextMenu?: (
    row: Row<TData>,
    event: MouseEvent<HTMLTableRowElement>,
  ) => void
  className?: string
  style?: CSSProperties
}

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
  className?: string
  style?: CSSProperties
}
