import type { AppDataTableProps } from '../types'

export interface AppVirtualDataTableProps<TData>
  extends Omit<AppDataTableProps<TData>, 'maxHeight'> {
  maxHeight: number | string
  estimatedRowHeight?: number
  overscan?: number
}
