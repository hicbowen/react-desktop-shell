import { forwardRef, useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { AppTextBox } from '../text-input'
import { useAppLocale } from '../localization/useAppLocale'
import type { AppSearchBoxProps } from './types'

function SearchIcon() {
  return <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" viewBox="0 0 16 16"><circle cx="7" cy="7" r="4.5" /><path d="m10.5 10.5 3 3" /></svg>
}

export const AppSearchBox = forwardRef<HTMLInputElement, AppSearchBoxProps>(function AppSearchBox({
  value,
  defaultValue = '',
  onValueChange,
  onSearch,
  debounceMs,
  clearOnEscape = true,
  onKeyDown,
  placeholder,
  ...rest
}, forwardedRef) {
  const { messages } = useAppLocale()
  const controlled = value !== undefined
  const [internalValue, setInternalValue] = useState(defaultValue)
  const currentValue = value ?? internalValue
  const skipNextDebounce = useRef(false)

  useEffect(() => {
    if (debounceMs === undefined || !onSearch || skipNextDebounce.current) {
      skipNextDebounce.current = false
      return
    }
    const timer = window.setTimeout(() => onSearch(currentValue), Math.max(0, debounceMs))
    return () => window.clearTimeout(timer)
  }, [currentValue, debounceMs, onSearch])

  const change = (next: string) => {
    if (!controlled) setInternalValue(next)
    onValueChange?.(next)
  }
  const submit = (next: string) => {
    skipNextDebounce.current = true
    onSearch?.(next)
  }
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented) return
    if (event.key === 'Enter') submit(currentValue)
    if (event.key === 'Escape' && clearOnEscape && currentValue) {
      event.preventDefault()
      change('')
      submit('')
    }
  }

  return <AppTextBox
    {...rest}
    aria-label={rest['aria-label'] ?? messages.searchBox.label}
    clearable
    onChange={(event) => change(event.currentTarget.value)}
    onClear={() => submit('')}
    onKeyDown={handleKeyDown}
    placeholder={placeholder ?? messages.searchBox.placeholder}
    ref={forwardedRef}
    role="searchbox"
    startIcon={<SearchIcon />}
    type="search"
    value={currentValue}
  />
})
