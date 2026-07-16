import { forwardRef, useEffect, useRef, useState } from 'react'
import type { FocusEvent, KeyboardEvent } from 'react'
import { useAppFieldContext } from '../field/AppFieldContext'
import type { AppNumberBoxProps } from './types'
import './AppNumberSelect.css'

function resolveBounds(min?: number, max?: number) {
  const lower = Number.isFinite(min) ? min : undefined
  const upper = Number.isFinite(max) ? max : undefined
  return lower != null && upper != null && lower > upper
    ? { min: lower, max: lower }
    : { min: lower, max: upper }
}

function normalizeNumber(value: number, min?: number, max?: number, precision?: number) {
  const bounds = resolveBounds(min, max)
  const clamped = Math.min(bounds.max ?? Number.POSITIVE_INFINITY, Math.max(bounds.min ?? Number.NEGATIVE_INFINITY, value))
  const digits = Number.isFinite(precision) ? Math.max(0, Math.floor(precision!)) : undefined
  return digits == null ? clamped : Number(clamped.toFixed(digits))
}

export const AppNumberBox = forwardRef<HTMLInputElement, AppNumberBoxProps>(function AppNumberBox({
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  allowEmpty = false,
  defaultValue = null,
  decrementLabel = 'Decrease value',
  disabled,
  formatValue = String,
  id,
  incrementLabel = 'Increase value',
  max,
  min,
  onBlur,
  onKeyDown,
  onValueChange,
  parseValue = (text) => {
    const parsed = Number(text)
    return text.trim() === '' || !Number.isFinite(parsed) ? null : parsed
  },
  precision,
  readOnly = false,
  required,
  step = 1,
  value,
  ...rest
}, ref) {
  const field = useAppFieldContext()
  const resolvedDisabled = disabled ?? field?.disabled ?? false
  const controlled = value !== undefined
  const initialValue = defaultValue != null && Number.isFinite(defaultValue)
    ? normalizeNumber(defaultValue, min, max, precision)
    : null
  const [internalValue, setInternalValue] = useState<number | null>(initialValue)
  const committedValue = controlled ? value : internalValue
  const [editingText, setEditingText] = useState(() => committedValue == null ? '' : formatValue(committedValue))
  const formatValueRef = useRef(formatValue)

  useEffect(() => { formatValueRef.current = formatValue }, [formatValue])
  useEffect(() => {
    if (controlled) setEditingText(value == null ? '' : formatValueRef.current(value))
  }, [controlled, value])

  const restore = () => setEditingText(committedValue == null ? '' : formatValue(committedValue))
  const commitValue = (candidate: number | null) => {
    const next = candidate == null ? null : normalizeNumber(candidate, min, max, precision)
    if (controlled) {
      if (!Object.is(next, committedValue)) onValueChange?.(next)
      restore()
      return
    }
    setInternalValue(next)
    setEditingText(next == null ? '' : formatValue(next))
    if (!Object.is(next, committedValue)) onValueChange?.(next)
  }
  const commitText = () => {
    if (editingText.trim() === '') {
      if (allowEmpty) commitValue(null)
      else restore()
      return
    }
    const parsed = parseValue(editingText)
    if (parsed == null || !Number.isFinite(parsed)) restore()
    else commitValue(parsed)
  }
  const safeStep = Number.isFinite(step) && step > 0 ? step : 1
  const changeBy = (direction: number) => {
    const parsed = parseValue(editingText)
    const base = parsed != null && Number.isFinite(parsed) ? parsed : committedValue
    if (base == null) return
    commitValue(base + safeStep * direction)
  }
  const handleBlur = (event: FocusEvent<HTMLInputElement>) => { commitText(); onBlur?.(event) }
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented || resolvedDisabled || readOnly) return
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') { event.preventDefault(); changeBy(event.key === 'ArrowUp' ? 1 : -1) }
    else if (event.key === 'Enter') { event.preventDefault(); commitText() }
    else if (event.key === 'Escape') { event.preventDefault(); restore() }
  }
  const bounds = resolveBounds(min, max)
  const formattedCommittedValue = committedValue == null ? undefined : formatValue(committedValue)
  const parsedEditingValue = parseValue(editingText)
  const effectiveValue = parsedEditingValue != null && Number.isFinite(parsedEditingValue)
    ? parsedEditingValue
    : committedValue

  return <span className={`app-number-box${resolvedDisabled ? ' app-number-box--disabled' : ''}`}><input {...rest} aria-describedby={ariaDescribedBy ?? field?.describedBy} aria-invalid={(ariaInvalid ?? field?.invalid) || undefined} aria-valuemax={bounds.max} aria-valuemin={bounds.min} aria-valuenow={committedValue ?? undefined} aria-valuetext={formattedCommittedValue} disabled={resolvedDisabled} id={id ?? field?.controlId} inputMode="decimal" onBlur={handleBlur} onChange={(event) => setEditingText(event.target.value)} onKeyDown={handleKeyDown} readOnly={readOnly} ref={ref} required={required ?? field?.required} role="spinbutton" type="text" value={editingText} /><span className="app-number-box__buttons"><button aria-label={incrementLabel} disabled={resolvedDisabled || readOnly || effectiveValue == null || (bounds.max != null && effectiveValue >= bounds.max)} onClick={() => changeBy(1)} type="button">+</button><button aria-label={decrementLabel} disabled={resolvedDisabled || readOnly || effectiveValue == null || (bounds.min != null && effectiveValue <= bounds.min)} onClick={() => changeBy(-1)} type="button">−</button></span></span>
})
