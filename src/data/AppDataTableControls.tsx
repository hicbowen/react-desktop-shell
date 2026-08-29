import type { Table } from '@tanstack/react-table'
import { Dismiss16Regular } from '@fluentui/react-icons/svg/dismiss'
import { Search16Regular } from '@fluentui/react-icons/svg/search'
import { useAppLocale } from '../localization/useAppLocale'
import type { AppDataTableControlsOptions } from './types'
import { hasFilterValue } from './internal/dataTableFilters'

interface AppDataTableControlsProps<TData> {
  table: Table<TData>
  options: AppDataTableControlsOptions<TData>
}

export function AppDataTableControls<TData>({
  table,
  options,
}: AppDataTableControlsProps<TData>) {
  const { messages } = useAppLocale()
  const locale = messages.dataTable
  const searchEnabled = options.search === true
  const globalFilter = table.getState().globalFilter
  const searchValue = typeof globalFilter === 'string' ? globalFilter : ''
  const activeColumnFilters = table
    .getState()
    .columnFilters.filter((filter) => hasFilterValue(filter.value))
  const hasActiveSearch = searchValue.length > 0
  const hasActiveControls = hasActiveSearch || activeColumnFilters.length > 0

  if (!searchEnabled && !(options.clearAll === true && hasActiveControls)) {
    return null
  }

  const clearAll = () => {
    table.setGlobalFilter('')
    table.setColumnFilters([])
  }

  return (
    <div className="app-data-table__controls">
      {searchEnabled ? (
        <div className="app-data-table__search">
          <span className="app-data-table__search-icon">
            <Search16Regular aria-hidden="true" focusable="false" />
          </span>
          <input
            aria-label={locale.searchAriaLabel}
            className="app-data-table__search-input"
            placeholder={locale.searchPlaceholder}
            type="search"
            value={searchValue}
            onChange={(event) =>
              table.setGlobalFilter(event.currentTarget.value)
            }
          />
          {hasActiveSearch ? (
            <button
              aria-label={locale.clearSearch}
              className="app-data-table__search-clear"
              type="button"
              onClick={() => table.setGlobalFilter('')}
            >
              <Dismiss16Regular aria-hidden="true" focusable="false" />
            </button>
          ) : null}
        </div>
      ) : null}

      {options.clearAll === true && hasActiveControls ? (
        <button
          aria-label={locale.clearAllAriaLabel}
          className="app-data-table__controls-clear-all"
          type="button"
          onClick={clearAll}
        >
          {locale.clearAll}
        </button>
      ) : null}
    </div>
  )
}
