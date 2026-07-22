import type { CSSProperties } from 'react'

export interface AppPaginationValue {
  pageIndex: number
  pageSize: number
}

export interface AppPaginationProps {
  total: number
  value?: AppPaginationValue
  defaultValue?: AppPaginationValue
  onValueChange?: (value: AppPaginationValue) => void
  pageSizeOptions?: readonly number[]
  showPageSizeSelector?: boolean
  showFirstLastButtons?: boolean
  showSummary?: boolean
  itemsPerPageLabel?: string
  formatRange?: (start: number, end: number, total: number) => string
  formatPage?: (page: number, pageCount: number) => string
  disabled?: boolean
  compact?: boolean
  className?: string
  style?: CSSProperties
}
