import type { Table } from '@tanstack/react-table'
import type {
  AppDataTablePaginationLocale,
  AppDataTablePaginationOptions,
} from './types'

interface AppDataTablePaginationProps<TData> {
  table: Table<TData>
  options: AppDataTablePaginationOptions
  loading: boolean
}

const defaultLocale: AppDataTablePaginationLocale = {
  rowsPerPageLabel: 'Rows per page',
  rangeLabel: (start, end, total) => `${start}–${end} of ${total}`,
  pageLabel: (page, pageCount) => `Page ${page} of ${pageCount}`,
  firstPageAriaLabel: 'First page',
  previousPageAriaLabel: 'Previous page',
  nextPageAriaLabel: 'Next page',
  lastPageAriaLabel: 'Last page',
}

function PaginationIcon({ direction }: { direction: 'first' | 'previous' | 'next' | 'last' }) {
  const points = direction === 'previous' || direction === 'first'
    ? '14 6 8 12 14 18'
    : '10 6 16 12 10 18'
  const edge = direction === 'first' ? 6 : direction === 'last' ? 18 : undefined

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <polyline points={points} />
      {edge !== undefined ? <line x1={edge} x2={edge} y1="6" y2="18" /> : null}
    </svg>
  )
}

export function AppDataTablePagination<TData>({
  table,
  options,
  loading,
}: AppDataTablePaginationProps<TData>) {
  const locale = { ...defaultLocale, ...options.locale }
  const pageSizeOptions = options.pageSizeOptions ?? [10, 20, 50]
  const showPageSizeSelector = options.showPageSizeSelector ?? true
  const showFirstLastButtons = options.showFirstLastButtons ?? true
  const total = table.getPrePaginationRowModel().rows.length
  const { pageIndex, pageSize } = table.getState().pagination
  const pageCount = table.getPageCount()
  const start = total === 0 ? 0 : pageIndex * pageSize + 1
  const end = total === 0 ? 0 : Math.min((pageIndex + 1) * pageSize, total)
  const atFirstPage = !table.getCanPreviousPage()
  const atLastPage = !table.getCanNextPage()

  return (
    <div className="app-data-table__pagination">
      <div className="app-data-table__pagination-summary">
        {locale.rangeLabel(start, end, total)}
      </div>
      <div className="app-data-table__pagination-controls">
        {showPageSizeSelector ? (
          <label className="app-data-table__pagination-size">
            <span>{locale.rowsPerPageLabel}</span>
            <select
              aria-label={locale.rowsPerPageLabel}
              disabled={loading}
              value={pageSize}
              onChange={(event) => table.setPageSize(Number(event.currentTarget.value))}
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
        ) : null}
        {showFirstLastButtons ? (
          <button
            aria-label={locale.firstPageAriaLabel}
            className="app-data-table__pagination-button"
            disabled={loading || atFirstPage}
            type="button"
            onClick={() => table.firstPage()}
          >
            <PaginationIcon direction="first" />
          </button>
        ) : null}
        <button
          aria-label={locale.previousPageAriaLabel}
          className="app-data-table__pagination-button"
          disabled={loading || atFirstPage}
          type="button"
          onClick={() => table.previousPage()}
        >
          <PaginationIcon direction="previous" />
        </button>
        <span className="app-data-table__pagination-page">
          {locale.pageLabel(total === 0 ? 0 : pageIndex + 1, pageCount)}
        </span>
        <button
          aria-label={locale.nextPageAriaLabel}
          className="app-data-table__pagination-button"
          disabled={loading || atLastPage}
          type="button"
          onClick={() => table.nextPage()}
        >
          <PaginationIcon direction="next" />
        </button>
        {showFirstLastButtons ? (
          <button
            aria-label={locale.lastPageAriaLabel}
            className="app-data-table__pagination-button"
            disabled={loading || atLastPage}
            type="button"
            onClick={() => table.lastPage()}
          >
            <PaginationIcon direction="last" />
          </button>
        ) : null}
      </div>
    </div>
  )
}
