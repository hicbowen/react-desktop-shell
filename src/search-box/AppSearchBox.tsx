import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type CompositionEvent,
  type KeyboardEvent,
} from 'react'
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
  onCompositionEnd,
  onCompositionStart,
  onKeyDown,
  placeholder,
  ...rest
}, forwardedRef) {
  const { messages } = useAppLocale()
  const controlled = value !== undefined
  const [internalValue, setInternalValue] = useState(defaultValue)
  const [isComposing, setIsComposing] = useState(false)
  const currentValue = value ?? internalValue
  const composingRef = useRef(false)
  const debounceTimerRef = useRef<number | null>(null)
  const skipDebounceValueRef = useRef<string | null>(null)

  useEffect(() => {
    if (isComposing || debounceMs === undefined || !onSearch) return

    if (skipDebounceValueRef.current !== null) {
      const skippedValue = skipDebounceValueRef.current
      skipDebounceValueRef.current = null
      if (skippedValue === currentValue) return
    }

    const timer = window.setTimeout(() => {
      debounceTimerRef.current = null
      onSearch(currentValue)
    }, Math.max(0, debounceMs))
    debounceTimerRef.current = timer

    return () => {
      window.clearTimeout(timer)
      if (debounceTimerRef.current === timer) {
        debounceTimerRef.current = null
      }
    }
  }, [currentValue, debounceMs, isComposing, onSearch])

  const clearPendingDebounce = () => {
    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
  }
  const change = (next: string) => {
    if (!controlled) setInternalValue(next)
    onValueChange?.(next)
  }
  const submit = (next: string, skipMatchingDebounce = false) => {
    clearPendingDebounce()
    if (skipMatchingDebounce) {
      skipDebounceValueRef.current = next
    }
    onSearch?.(next)
  }
  const handleCompositionStart = (
    event: CompositionEvent<HTMLInputElement>,
  ) => {
    composingRef.current = true
    setIsComposing(true)
    onCompositionStart?.(event)
  }
  const handleCompositionEnd = (
    event: CompositionEvent<HTMLInputElement>,
  ) => {
    composingRef.current = false
    setIsComposing(false)
    onCompositionEnd?.(event)
  }
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event)
    if (
      event.defaultPrevented ||
      composingRef.current ||
      event.nativeEvent.isComposing
    ) {
      return
    }
    if (event.key === 'Enter') submit(currentValue)
    if (event.key === 'Escape' && clearOnEscape && currentValue) {
      event.preventDefault()
      change('')
      submit('', true)
    }
  }

  return <AppTextBox
    {...rest}
    aria-label={rest['aria-label'] ?? messages.searchBox.label}
    clearable
    onChange={(event) => change(event.currentTarget.value)}
    onClear={() => submit('', true)}
    onCompositionEnd={handleCompositionEnd}
    onCompositionStart={handleCompositionStart}
    onKeyDown={handleKeyDown}
    placeholder={placeholder ?? messages.searchBox.placeholder}
    ref={forwardedRef}
    role="searchbox"
    startIcon={<SearchIcon />}
    type="search"
    value={currentValue}
  />
})
