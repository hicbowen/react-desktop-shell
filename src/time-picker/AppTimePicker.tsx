import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import { createPortal } from 'react-dom'
import { useAppFieldContext } from '../field/AppFieldContext'
import { OverlayParentContext } from '../overlay/OverlayTreeContext'
import { OVERLAY_SURFACE_FALLBACK_STYLE } from '../overlay/surfaceFallback'
import { AppTimePanel } from './AppTimePanel'
import { formatAppTime, formatAppTimeISO } from './timeFormat'
import {
  clampAppTime,
  getCurrentAppTime,
  normalizeMinuteStep,
  roundTimeToStep,
} from './timeMath'
import type {
  AppTimePickerLocale,
  AppTimePickerProps,
  AppTimeValue,
} from './types'
import { useTimePickerOverlay } from './useTimePickerOverlay'
import './AppTimePicker.css'

const defaultLocaleText: AppTimePickerLocale = {
  timeButtonLabel: 'Open time picker',
  clearButtonLabel: 'Clear time',
  hourLabel: 'Hour',
  minuteLabel: 'Minute',
  cancelLabel: 'Cancel',
  applyLabel: 'Apply',
}

function TimeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path d="M8 1.5A6.5 6.5 0 1 1 1.5 8 6.5 6.5 0 0 1 8 1.5Zm0 1A5.5 5.5 0 1 0 13.5 8 5.5 5.5 0 0 0 8 2.5Zm0 2a.5.5 0 0 1 .5.5v2.79l1.85 1.06a.5.5 0 1 1-.5.87l-2.1-1.22A.5.5 0 0 1 7.5 8V5a.5.5 0 0 1 .5-.5Z" />
    </svg>
  )
}

function initialTime(
  value: AppTimeValue | null,
  step: number,
  minValue?: AppTimeValue,
  maxValue?: AppTimeValue,
) {
  return clampAppTime(
    roundTimeToStep(value ?? getCurrentAppTime(), step),
    minValue,
    maxValue,
  )
}

export function AppTimePicker({
  value,
  defaultValue = null,
  onValueChange,
  open,
  defaultOpen = false,
  onOpenChange,
  minValue,
  maxValue,
  minuteStep,
  hourCycle = 24,
  locale = 'en-US',
  placeholder = 'Select a time',
  allowClear = false,
  disabled,
  readOnly = false,
  required,
  invalid,
  name,
  id,
  className,
  style,
  localeText,
}: AppTimePickerProps) {
  const field = useAppFieldContext()
  const controlled = value !== undefined
  const [internalValue, setInternalValue] = useState(defaultValue)
  const committedValue = controlled ? value : internalValue
  const resolvedDisabled = disabled ?? field?.disabled ?? false
  const resolvedRequired = required ?? field?.required
  const resolvedInvalid = invalid ?? field?.invalid
  const resolvedLocaleText = { ...defaultLocaleText, ...localeText }
  const step = normalizeMinuteStep(minuteStep)
  const anchorRef = useRef<HTMLDivElement | null>(null)
  const displayRef = useRef<HTMLButtonElement | null>(null)
  const timeButtonRef = useRef<HTMLButtonElement | null>(null)
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const [pendingValue, setPendingValue] = useState(() =>
    initialTime(committedValue ?? null, step, minValue, maxValue),
  )
  const wasOpenRef = useRef(false)
  const resetPending = useCallback(
    () =>
      setPendingValue(
        initialTime(committedValue ?? null, step, minValue, maxValue),
      ),
    [committedValue, maxValue, minValue, step],
  )
  const overlay = useTimePickerOverlay({
    open,
    defaultOpen,
    onOpenChange,
    anchorRef,
    overlayRef,
    focusRef: timeButtonRef,
    onDismiss: resetPending,
    dependencies: [locale, hourCycle, step],
  })

  useEffect(() => {
    if (overlay.visible && !wasOpenRef.current) resetPending()
    wasOpenRef.current = overlay.visible
  }, [overlay.visible, resetPending])

  const setCommittedValue = (next: AppTimeValue | null) => {
    if (!controlled) setInternalValue(next)
    onValueChange?.(next)
  }
  const openPanel = () => {
    if (!resolvedDisabled) overlay.setVisible(true)
  }
  const cancel = () => {
    resetPending()
    overlay.setVisible(false)
    timeButtonRef.current?.focus({ preventScroll: true })
  }
  const handleDisplayKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.altKey && event.key === 'ArrowDown') {
      event.preventDefault()
      openPanel()
    }
  }
  const popup = overlay.visible && typeof document !== 'undefined' ? (
    <OverlayParentContext.Provider value={overlay.overlayTree.overlayId}>
      <div
        className="app-time-picker__popup"
        data-placement={overlay.position.placement}
        ref={overlayRef}
        style={{
          ...(overlay.overlayHost
            ? undefined
            : OVERLAY_SURFACE_FALLBACK_STYLE),
          left: overlay.position.x,
          maxHeight: overlay.position.measured
            ? overlay.position.maxHeight
            : undefined,
          maxWidth: overlay.position.measured
            ? overlay.position.maxWidth
            : undefined,
          pointerEvents: overlay.position.measured ? 'auto' : 'none',
          top: overlay.position.y,
          visibility: overlay.position.measured ? 'visible' : 'hidden',
        }}
      >
        <AppTimePanel
          hourCycle={hourCycle}
          hourLabel={resolvedLocaleText.hourLabel}
          locale={locale}
          maxValue={maxValue}
          minValue={minValue}
          minuteLabel={resolvedLocaleText.minuteLabel}
          minuteStep={step}
          onValueChange={setPendingValue}
          readOnly={readOnly}
          value={pendingValue}
        />
        <footer className="app-time-picker__footer">
          <button
            className="app-time-picker__action"
            onClick={cancel}
            type="button"
          >
            {resolvedLocaleText.cancelLabel}
          </button>
          <button
            className="app-time-picker__action app-time-picker__action--primary"
            disabled={readOnly}
            onClick={() => {
              if (readOnly) return
              setCommittedValue(pendingValue)
              overlay.setVisible(false)
              timeButtonRef.current?.focus({ preventScroll: true })
            }}
            type="button"
          >
            {resolvedLocaleText.applyLabel}
          </button>
        </footer>
      </div>
    </OverlayParentContext.Provider>
  ) : null
  const displayText = committedValue
    ? formatAppTime(committedValue, locale, hourCycle)
    : null

  return (
    <>
      <div
        className={[
          'app-time-picker',
          resolvedInvalid ? 'app-time-picker--invalid' : '',
          resolvedDisabled ? 'app-time-picker--disabled' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        ref={anchorRef}
        style={style}
      >
        <button
          aria-describedby={field?.describedBy}
          aria-expanded={overlay.visible}
          aria-haspopup="dialog"
          aria-invalid={resolvedInvalid || undefined}
          aria-required={resolvedRequired || undefined}
          className={[
            'app-time-picker__display',
            displayText ? '' : 'app-time-picker__display--placeholder',
          ]
            .filter(Boolean)
            .join(' ')}
          disabled={resolvedDisabled}
          id={id ?? field?.controlId}
          onClick={openPanel}
          onKeyDown={handleDisplayKeyDown}
          ref={displayRef}
          type="button"
        >
          {displayText ?? placeholder}
        </button>
        {allowClear && committedValue && !resolvedDisabled && !readOnly ? (
          <button
            aria-label={resolvedLocaleText.clearButtonLabel}
            className="app-time-picker__icon-button"
            onClick={() => {
              setCommittedValue(null)
              displayRef.current?.focus({ preventScroll: true })
            }}
            type="button"
          >
            <span aria-hidden="true">×</span>
          </button>
        ) : null}
        <button
          aria-label={resolvedLocaleText.timeButtonLabel}
          aria-expanded={overlay.visible}
          aria-haspopup="dialog"
          className="app-time-picker__icon-button"
          disabled={resolvedDisabled}
          onClick={() => {
            if (overlay.visible) cancel()
            else openPanel()
          }}
          ref={timeButtonRef}
          type="button"
        >
          <TimeIcon />
        </button>
      </div>
      {name ? (
        <input
          disabled={resolvedDisabled}
          name={name}
          type="hidden"
          value={committedValue ? formatAppTimeISO(committedValue) : ''}
        />
      ) : null}
      {popup
        ? createPortal(popup, overlay.overlayHost ?? document.body)
        : null}
    </>
  )
}
