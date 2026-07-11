import type { CSSProperties, MouseEvent, ReactNode } from 'react'
import type {
  ColumnDef,
  ColumnFiltersState,
  ColumnPinningState,
  ColumnResizeMode,
  ColumnSizingState,
  OnChangeFn,
  Row,
  RowSelectionState,
  SortingState,
  TableOptions,
  VisibilityState,
} from '@tanstack/react-table'

export type AppDataTableColumn<TData> = ColumnDef<TData>

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
  /**
   * Flat leaf-column definitions.
   *
   * Multi-level grouped headers are not currently supported.
   */
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
  onRowClick?: (
    row: Row<TData>,
    event: MouseEvent<HTMLTableRowElement>,
  ) => void
  className?: string
  style?: CSSProperties
}

export interface AppDataViewProps {
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
