import { useState } from 'react'
import { useAppLocale } from '../localization/useAppLocale'
import type { AppPaginationProps, AppPaginationValue } from './types'
import './AppPagination.css'

function PaginationIcon({ direction }: { direction: 'first' | 'previous' | 'next' | 'last' }) {
  const points = direction === 'previous' || direction === 'first'
    ? '14 6 8 12 14 18'
    : '10 6 16 12 10 18'
  const edge = direction === 'first' ? 6 : direction === 'last' ? 18 : undefined
  return <svg aria-hidden="true" viewBox="0 0 24 24"><polyline points={points} />{edge !== undefined ? <line x1={edge} x2={edge} y1="6" y2="18" /> : null}</svg>
}

function normalizeValue(value: AppPaginationValue, total: number) {
  const pageSize = Math.max(1, Math.floor(value.pageSize))
  const pageCount = Math.ceil(Math.max(0, total) / pageSize)
  return {
    pageIndex: Math.min(Math.max(0, Math.floor(value.pageIndex)), Math.max(0, pageCount - 1)),
    pageSize,
  }
}

export function AppPagination({
  total,
  value,
  defaultValue = { pageIndex: 0, pageSize: 10 },
  onValueChange,
  pageSizeOptions = [10, 20, 50],
  showPageSizeSelector = true,
  showFirstLastButtons = true,
  showSummary = true,
  itemsPerPageLabel,
  formatRange,
  formatPage,
  disabled = false,
  compact = false,
  className,
  style,
}: AppPaginationProps) {
  const { messages } = useAppLocale()
  const text = messages.pagination
  const sizeLabel = itemsPerPageLabel ?? text.itemsPerPage
  const controlled = value !== undefined
  const [internalValue, setInternalValue] = useState(() => normalizeValue(defaultValue, total))
  const current = normalizeValue(value ?? internalValue, total)
  const pageCount = Math.ceil(Math.max(0, total) / current.pageSize)
  const start = total === 0 ? 0 : current.pageIndex * current.pageSize + 1
  const end = total === 0 ? 0 : Math.min((current.pageIndex + 1) * current.pageSize, total)

  const update = (next: AppPaginationValue) => {
    const normalized = normalizeValue(next, total)
    if (!controlled) setInternalValue(normalized)
    onValueChange?.(normalized)
  }

  const classes = ['app-pagination', compact ? 'app-pagination--compact' : '', className]
    .filter(Boolean)
    .join(' ')
  const atFirstPage = current.pageIndex === 0
  const atLastPage = pageCount === 0 || current.pageIndex >= pageCount - 1

  return <nav aria-label={text.label} className={classes} style={style}>
    {showSummary ? <div className="app-pagination__summary">{(formatRange ?? text.range)(start, end, total)}</div> : null}
    <div className="app-pagination__controls">
      {showPageSizeSelector ? <label className="app-pagination__size"><span>{sizeLabel}</span><select aria-label={sizeLabel} disabled={disabled} value={current.pageSize} onChange={(event) => update({ pageIndex: 0, pageSize: Number(event.currentTarget.value) })}>{pageSizeOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label> : null}
      {showFirstLastButtons ? <button aria-label={text.firstPage} className="app-pagination__button" disabled={disabled || atFirstPage} onClick={() => update({ ...current, pageIndex: 0 })} type="button"><PaginationIcon direction="first" /></button> : null}
      <button aria-label={text.previousPage} className="app-pagination__button" disabled={disabled || atFirstPage} onClick={() => update({ ...current, pageIndex: current.pageIndex - 1 })} type="button"><PaginationIcon direction="previous" /></button>
      <span className="app-pagination__page">{(formatPage ?? text.page)(total === 0 ? 0 : current.pageIndex + 1, pageCount)}</span>
      <button aria-label={text.nextPage} className="app-pagination__button" disabled={disabled || atLastPage} onClick={() => update({ ...current, pageIndex: current.pageIndex + 1 })} type="button"><PaginationIcon direction="next" /></button>
      {showFirstLastButtons ? <button aria-label={text.lastPage} className="app-pagination__button" disabled={disabled || atLastPage} onClick={() => update({ ...current, pageIndex: Math.max(0, pageCount - 1) })} type="button"><PaginationIcon direction="last" /></button> : null}
    </div>
  </nav>
}
