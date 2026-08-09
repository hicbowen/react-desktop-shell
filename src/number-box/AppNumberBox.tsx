import { forwardRef, useEffect, useRef, useState } from 'react'
import type { FocusEvent, KeyboardEvent, ReactNode } from 'react'
import { ChevronDown16Regular } from '@fluentui/react-icons/svg/chevron-down'
import { ChevronUp16Regular } from '@fluentui/react-icons/svg/chevron-up'
import { ChevronUpDown16Regular } from '@fluentui/react-icons/svg/chevron-up-down'
import { useAppFieldContext } from '../field/AppFieldContext'
import { useAppLocale } from '../localization/useAppLocale'
import { AppPopover } from '../popover'
import type { AppNumberBoxProps } from './types'
import '../input-frame/AppInputFrame.css'
import './AppNumberBox.css'

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
  className,
  defaultValue = null,
  disabled,
  formatValue = String,
  largeStep,
  id,
  max,
  min,
  onBlur,
  onFocus,
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
  spinButtonPlacement = 'inline',
  style,
  value,
  ...rest
}, ref) {
  const field = useAppFieldContext()
  const { messages } = useAppLocale()
  const rootRef = useRef<HTMLSpanElement>(null)
  const compactPanelRef = useRef<HTMLDivElement>(null)
  const [compactOpen, setCompactOpen] = useState(false)
  const resolvedDisabled = disabled ?? field?.disabled ?? false
  const resolvedInvalid = ariaInvalid ?? field?.invalid
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
  const safeLargeStep = Number.isFinite(largeStep) && largeStep! > 0 ? largeStep! : safeStep * 10
  const changeBy = (direction: number, amount = safeStep) => {
    const parsed = parseValue(editingText)
    const base = parsed != null && Number.isFinite(parsed) ? parsed : committedValue ?? 0
    commitValue(base + amount * direction)
  }
  const isWithinCompactSurface = (target: EventTarget | null) => {
    if (!(target instanceof Node)) return false
    return Boolean(rootRef.current?.contains(target) || compactPanelRef.current?.contains(target))
  }
  useEffect(() => {
    if (spinButtonPlacement !== 'compact' || resolvedDisabled || readOnly) setCompactOpen(false)
  }, [readOnly, resolvedDisabled, spinButtonPlacement])
  const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
    onFocus?.(event)
    if (!event.defaultPrevented && spinButtonPlacement === 'compact' && !resolvedDisabled && !readOnly) setCompactOpen(true)
  }
  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    commitText()
    onBlur?.(event)
    if (!isWithinCompactSurface(event.relatedTarget)) setCompactOpen(false)
  }
  const handleCompactTriggerFocus = () => {
    if (!resolvedDisabled && !readOnly) setCompactOpen(true)
  }
  const handleCompactTriggerBlur = (event: FocusEvent<HTMLButtonElement>) => {
    if (!isWithinCompactSurface(event.relatedTarget)) setCompactOpen(false)
  }
  const handleCompactPanelBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!isWithinCompactSurface(event.relatedTarget)) setCompactOpen(false)
  }
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented || resolvedDisabled || readOnly) return
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') { event.preventDefault(); changeBy(event.key === 'ArrowUp' ? 1 : -1, event.shiftKey ? safeLargeStep : safeStep) }
    else if (event.key === 'PageUp' || event.key === 'PageDown') { event.preventDefault(); changeBy(event.key === 'PageUp' ? 1 : -1, safeLargeStep) }
    else if (event.key === 'Enter') { event.preventDefault(); commitText() }
    else if (event.key === 'Escape') { event.preventDefault(); restore() }
  }
  const bounds = resolveBounds(min, max)
  const formattedCommittedValue = committedValue == null ? undefined : formatValue(committedValue)
  const parsedEditingValue = parseValue(editingText)
  const effectiveValue = parsedEditingValue != null && Number.isFinite(parsedEditingValue)
    ? parsedEditingValue
    : committedValue
  const canIncrease = !resolvedDisabled && !readOnly && (effectiveValue == null || bounds.max == null || effectiveValue < bounds.max)
  const canDecrease = !resolvedDisabled && !readOnly && (effectiveValue == null || bounds.min == null || effectiveValue > bounds.min)
  const button = (direction: 1 | -1, label: string, icon: ReactNode, enabled: boolean) => <button aria-label={label} disabled={!enabled} onClick={() => changeBy(direction)} onPointerDown={(event) => event.preventDefault()} type="button"><span aria-hidden="true" className="app-number-box__button-icon">{icon}</span></button>
  const compactControls = spinButtonPlacement === 'compact' ? <AppPopover ariaLabel={messages.numberBox.openActions} className="app-number-box__compact-popover" offset={6} onOpenChange={setCompactOpen} open={compactOpen} placement="right" trigger={<button aria-label={messages.numberBox.openActions} className="app-number-box__compact-trigger" disabled={resolvedDisabled || readOnly} onBlur={handleCompactTriggerBlur} onFocus={handleCompactTriggerFocus} onPointerDown={(event) => event.preventDefault()} type="button"><span aria-hidden="true" className="app-number-box__button-icon"><ChevronUpDown16Regular /></span></button>}><div className="app-number-box__compact-panel" onBlur={handleCompactPanelBlur} ref={compactPanelRef}>{button(1, messages.numberBox.increase, <ChevronUp16Regular />, canIncrease)}{button(-1, messages.numberBox.decrease, <ChevronDown16Regular />, canDecrease)}</div></AppPopover> : null

  return <span className={['app-number-box', 'app-input-frame', `app-number-box--${spinButtonPlacement}`, resolvedInvalid ? 'app-input-frame--invalid' : '', resolvedDisabled ? 'app-number-box--disabled app-input-frame--disabled' : '', readOnly ? 'app-input-frame--readonly' : '', compactOpen ? 'app-input-frame--active' : '', className].filter(Boolean).join(' ')} ref={rootRef} style={style}><input {...rest} aria-describedby={ariaDescribedBy ?? field?.describedBy} aria-invalid={resolvedInvalid || undefined} aria-valuemax={bounds.max} aria-valuemin={bounds.min} aria-valuenow={committedValue ?? undefined} aria-valuetext={formattedCommittedValue} disabled={resolvedDisabled} id={id ?? field?.controlId} inputMode="decimal" onBlur={handleBlur} onChange={(event) => setEditingText(event.target.value)} onFocus={handleFocus} onKeyDown={handleKeyDown} readOnly={readOnly} ref={ref} required={required ?? field?.required} role="spinbutton" type="text" value={editingText} />{spinButtonPlacement === 'inline' ? <span className="app-number-box__buttons">{button(1, messages.numberBox.increase, <ChevronUp16Regular />, canIncrease)}{button(-1, messages.numberBox.decrease, <ChevronDown16Regular />, canDecrease)}</span> : compactControls}</span>
})
