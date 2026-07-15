import {
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import type { Table } from '@tanstack/react-table'
import { useAppOverlayHost } from '../overlay/AppOverlayHostContext'
import { useAnchoredOverlayPosition } from '../overlay/useAnchoredOverlayPosition'
import { useOverlayDismiss } from '../overlay/useOverlayDismiss'
import type {
  AppDataTableControlsLocale,
  AppDataTableControlsOptions,
  AppDataTableFilterDefinition,
  AppDataTableSearchOptions,
} from './types'

const defaultControlsLocale: AppDataTableControlsLocale = {
  searchPlaceholder: 'Search rows',
  searchAriaLabel: 'Search rows',
  clearSearchAriaLabel: 'Clear search',
  filtersLabel: 'Filters',
  activeFiltersAriaLabel: (count) => `Filters, ${count} active`,
  unnamedFilterAriaLabel: (index) => `field ${index + 1}`,
  clearFilterLabel: 'Clear',
  clearFilterAriaLabel: (label) => `Clear ${label} filter`,
  clearFiltersLabel: 'Clear filters',
  clearAllLabel: 'Clear all',
  clearAllAriaLabel: 'Clear all search and filters',
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <circle cx="7" cy="7" r="4.25" />
      <path d="m10.25 10.25 3 3" />
    </svg>
  )
}

function FilterIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path d="M2.5 3h11L9.25 8v4l-2.5 1V8z" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path d="m4.5 4.5 7 7m0-7-7 7" />
    </svg>
  )
}

function hasFilterValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.length > 0
  }
  return value !== undefined && value !== null && value !== ''
}

function accessibleLabel(
  label: ReactNode,
  index: number,
  locale: AppDataTableControlsLocale,
) {
  return typeof label === 'string' || typeof label === 'number'
    ? String(label)
    : locale.unnamedFilterAriaLabel(index)
}

function activateWithKeyboard(
  event: KeyboardEvent<HTMLButtonElement>,
  action: () => void,
) {
  if (event.key !== 'Enter' && event.key !== ' ') {
    return
  }

  event.preventDefault()
  action()
}

interface AppDataTableControlsProps<TData> {
  table: Table<TData>
  options: AppDataTableControlsOptions<TData>
  filterDefinitions: AppDataTableFilterDefinition<TData>[]
}

const FILTER_MENU_GAP = 5
const FILTER_MENU_MAX_HEIGHT = 420
const FILTER_MENU_MAX_WIDTH = 340
const FILTER_MENU_VIEWPORT_PADDING = 8

export function AppDataTableControls<TData>({
  table,
  options,
  filterDefinitions,
}: AppDataTableControlsProps<TData>) {
  const [menuOpen, setMenuOpen] = useState(false)
  const filterButtonRef = useRef<HTMLButtonElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const overlayHost = useAppOverlayHost()
  const menuId = useId()
  const locale = { ...defaultControlsLocale, ...options.locale }
  const searchOptions: AppDataTableSearchOptions | null = options.search
    ? options.search === true
      ? {}
      : options.search
    : null
  const globalFilter = table.getState().globalFilter
  const searchValue = typeof globalFilter === 'string' ? globalFilter : ''
  const activeColumnFilters = table
    .getState()
    .columnFilters.filter((filter) => hasFilterValue(filter.value))
  const activeFilterCount = activeColumnFilters.length
  const hasActiveSearch = searchValue.length > 0
  const hasActiveControls = hasActiveSearch || activeFilterCount > 0
  const showFilters = filterDefinitions.length > 0
  const closeMenu = () => setMenuOpen(false)
  const menuPosition = useAnchoredOverlayPosition({
    open: menuOpen,
    triggerRef: filterButtonRef,
    overlayRef: menuRef,
    preferredPlacement: 'bottom-end',
    gap: FILTER_MENU_GAP,
    viewportPadding: FILTER_MENU_VIEWPORT_PADDING,
    maxHeight: FILTER_MENU_MAX_HEIGHT,
    maxWidth: FILTER_MENU_MAX_WIDTH,
    dependencies: [activeFilterCount],
  })

  useOverlayDismiss({
    open: menuOpen,
    triggerRef: filterButtonRef,
    overlayRef: menuRef,
    onDismiss: closeMenu,
    restoreFocus: true,
  })

  if (!searchOptions && !showFilters) {
    return null
  }

  const clearAll = () => {
    table.setGlobalFilter('')
    table.setColumnFilters([])
  }

  const toggleFilterMenu = () => {
    setMenuOpen((current) => !current)
  }

  const openFilterMenu = () => {
    setMenuOpen(true)
  }

  return (
    <div className="app-data-table__controls">
      {searchOptions ? (
        <div className="app-data-table__search">
          <span className="app-data-table__search-icon">
            <SearchIcon />
          </span>
          <input
            aria-label={searchOptions.ariaLabel ?? locale.searchAriaLabel}
            className="app-data-table__search-input"
            placeholder={searchOptions.placeholder ?? locale.searchPlaceholder}
            type="search"
            value={searchValue}
            onChange={(event) => table.setGlobalFilter(event.currentTarget.value)}
          />
          {hasActiveSearch ? (
            <button
              aria-label={
                searchOptions.clearAriaLabel ?? locale.clearSearchAriaLabel
              }
              className="app-data-table__search-clear"
              type="button"
              onClick={() => table.setGlobalFilter('')}
            >
              <CloseIcon />
            </button>
          ) : null}
        </div>
      ) : null}

      {showFilters ? (
        <div className="app-data-table__filter">
          <button
            ref={filterButtonRef}
            aria-controls={menuOpen ? menuId : undefined}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-label={
              activeFilterCount > 0
                ? locale.activeFiltersAriaLabel(activeFilterCount)
                : locale.filtersLabel
            }
            className="app-data-table__filter-button"
            type="button"
            onClick={toggleFilterMenu}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown') {
                event.preventDefault()
                openFilterMenu()
                return
              }
              activateWithKeyboard(event, toggleFilterMenu)
            }}
          >
            <FilterIcon />
            <span>{locale.filtersLabel}</span>
            {activeFilterCount > 0 ? (
              <span
                aria-hidden="true"
                className="app-data-table__filter-count"
              >
                {activeFilterCount}
              </span>
            ) : null}
          </button>

          {menuOpen
            ? (() => {
                const menu = (
                  <div
                    ref={menuRef}
                    aria-label={locale.filtersLabel}
                    className="app-data-table__filter-menu app-scrollbar"
                    data-placement={menuPosition.placement}
                    id={menuId}
                    role="menu"
                    style={{
                      left: menuPosition.x,
                      maxHeight: menuPosition.measured
                        ? menuPosition.maxHeight
                        : FILTER_MENU_MAX_HEIGHT,
                      maxWidth: menuPosition.measured
                        ? menuPosition.maxWidth
                        : undefined,
                      pointerEvents: menuPosition.measured
                        ? undefined
                        : 'none',
                      top: menuPosition.y,
                      visibility: menuPosition.measured ? 'visible' : 'hidden',
                    }}
                  >
              {filterDefinitions.map((definition, index) => {
                const column = table.getColumn(definition.columnId)
                if (!column) {
                  return null
                }

                const mode = definition.mode ?? 'single'
                const value = column.getFilterValue()
                const selectedValues = Array.isArray(value)
                  ? value.map(String)
                  : []
                const fieldActive = hasFilterValue(value)
                const labelId = `${menuId}-group-${index}`
                const label = accessibleLabel(definition.label, index, locale)

                return (
                  <div
                    aria-labelledby={labelId}
                    className="app-data-table__filter-group"
                    key={definition.columnId}
                    role="group"
                  >
                    <div className="app-data-table__filter-group-header">
                      <span id={labelId}>{definition.label}</span>
                      {fieldActive ? (
                        <button
                          aria-label={locale.clearFilterAriaLabel(label)}
                          className="app-data-table__filter-clear"
                          role="menuitem"
                          type="button"
                          onClick={() => column.setFilterValue(undefined)}
                        >
                          {locale.clearFilterLabel}
                        </button>
                      ) : null}
                    </div>

                    <div className="app-data-table__filter-options">
                      {definition.options.map((option) => {
                        const checked =
                          mode === 'multiple'
                            ? selectedValues.includes(option.value)
                            : String(value ?? '') === option.value
                        const selectOption = () => {
                          if (mode === 'multiple') {
                            const next = checked
                              ? selectedValues.filter(
                                  (selected) => selected !== option.value,
                                )
                              : [...selectedValues, option.value]
                            column.setFilterValue(
                              next.length > 0 ? next : undefined,
                            )
                            return
                          }

                          column.setFilterValue(option.value)
                        }

                        return (
                          <button
                            aria-checked={checked}
                            className="app-data-table__filter-option"
                            key={option.value}
                            role={
                              mode === 'multiple'
                                ? 'menuitemcheckbox'
                                : 'menuitemradio'
                            }
                            type="button"
                            onClick={selectOption}
                            onKeyDown={(event) =>
                              activateWithKeyboard(event, selectOption)
                            }
                          >
                            <span
                              aria-hidden="true"
                              className="app-data-table__filter-check"
                            >
                              {checked ? '✓' : ''}
                            </span>
                            <span>{option.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}

              {activeFilterCount > 0 ? (
                <div className="app-data-table__filter-menu-footer">
                  <button
                    className="app-data-table__filter-clear-all"
                    role="menuitem"
                    type="button"
                    onClick={() => table.setColumnFilters([])}
                  >
                    {locale.clearFiltersLabel}
                  </button>
                </div>
              ) : null}
                  </div>
                )

                return overlayHost ? createPortal(menu, overlayHost) : menu
              })()
            : null}
        </div>
      ) : null}

      {options.clearAll === true && hasActiveControls ? (
        <button
          aria-label={locale.clearAllAriaLabel}
          className="app-data-table__controls-clear-all"
          type="button"
          onClick={clearAll}
        >
          {locale.clearAllLabel}
        </button>
      ) : null}
    </div>
  )
}
