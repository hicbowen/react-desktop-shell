import type { Table } from '@tanstack/react-table'
import { useAppLocale } from '../localization/useAppLocale'
import { AppPagination } from '../pagination'
import type { AppDataTablePaginationOptions } from './types'

interface AppDataTablePaginationProps<TData> {
  table: Table<TData>
  options: AppDataTablePaginationOptions
  loading: boolean
}

export function AppDataTablePagination<TData>({
  table,
  options,
  loading,
}: AppDataTablePaginationProps<TData>) {
  const { messages } = useAppLocale()
  const locale = messages.dataTable
  return <AppPagination
    className="app-data-table__pagination"
    disabled={loading}
    formatPage={locale.page}
    formatRange={locale.range}
    itemsPerPageLabel={locale.rowsPerPage}
    onValueChange={(next) => table.setPagination(next)}
    pageSizeOptions={options.pageSizeOptions}
    showFirstLastButtons={options.showFirstLastButtons}
    showPageSizeSelector={options.showPageSizeSelector}
    total={table.getPrePaginationRowModel().rows.length}
    value={table.getState().pagination}
  />
}
