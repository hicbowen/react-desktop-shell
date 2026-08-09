import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import { createPortal } from 'react-dom'
import { Clock16Regular } from '@fluentui/react-icons/svg/clock'
import { AppButton } from '../button'
import { useAppFieldContext } from '../field/AppFieldContext'
import { useAppLocale } from '../localization/useAppLocale'
import { OverlayParentContext } from '../overlay/OverlayTreeContext'
import { getAnchoredOverlaySurfaceStyle } from '../overlay/getAnchoredOverlaySurfaceStyle'
import { AppTimePanel } from './AppTimePanel'
import { formatAppTime, formatAppTimeISO } from './timeFormat'
import {
  compareAppTimes,
  getCurrentAppTime,
  hasAvailableTimeValue,
  isTimeAlignedToStep,
  isValidAppTime,
  normalizeTimeToStep,
  normalizeMinuteStep,
} from './timeMath'
import type {
  AppTimePickerProps,
  AppTimeValue,
} from './types'
import { useTimePickerOverlay } from './useTimePickerOverlay'
import '../input-frame/AppInputFrame.css'
import './AppTimePicker.css'

function initialTime(
  value: AppTimeValue | null,
  step: number,
  minValue?: AppTimeValue,
  maxValue?: AppTimeValue,
) {
  return normalizeTimeToStep(
    value ?? getCurrentAppTime(),
    step,
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
  allowClear = false,
  disabled,
  readOnly = false,
  required,
  invalid,
  name,
  id,
  className,
  style,
}: AppTimePickerProps) {
  const field = useAppFieldContext()
  const { locale, messages, hourCycle } = useAppLocale()
  const controlled = value !== undefined
  const [internalValue, setInternalValue] = useState(defaultValue)
  const committedValue = controlled ? value : internalValue
  const resolvedDisabled = disabled ?? field?.disabled ?? false
  const resolvedRequired = required ?? field?.required
  const resolvedInvalid = invalid ?? field?.invalid
  const step = normalizeMinuteStep(minuteStep)
  const anchorRef = useRef<HTMLDivElement | null>(null)
  const displayRef = useRef<HTMLButtonElement | null>(null)
  const timeButtonRef = useRef<HTMLButtonElement | null>(null)
  const openerRef = useRef<HTMLElement | null>(null)
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const [pendingValue, setPendingValue] = useState(() =>
    initialTime(committedValue ?? null, step, minValue, maxValue),
  )
  const [hasAvailableValue, setHasAvailableValue] = useState(() =>
    hasAvailableTimeValue(step, minValue, maxValue),
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
    onAfterClose: () => {
      resetPending()
      ;(openerRef.current ?? timeButtonRef.current)?.focus({
        preventScroll: true,
      })
    },
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
  const openPanel = (opener: HTMLElement) => {
    if (!resolvedDisabled) {
      openerRef.current = opener
      overlay.setVisible(true)
    }
  }
  const cancel = () => {
    overlay.requestClose('cancel')
  }
  const handleDisplayKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.altKey && event.key === 'ArrowDown') {
      event.preventDefault()
      openPanel(event.currentTarget)
    }
  }
  const canApply =
    !readOnly &&
    hasAvailableValue &&
    isValidAppTime(pendingValue) &&
    isTimeAlignedToStep(pendingValue, step) &&
    (!minValue || compareAppTimes(pendingValue, minValue) >= 0) &&
    (!maxValue || compareAppTimes(pendingValue, maxValue) <= 0)
  const popup = overlay.visible && typeof document !== 'undefined' ? (
    <OverlayParentContext.Provider value={overlay.overlayTree.overlayId}>
      <div
        aria-label={messages.timePicker.dialogLabel}
        aria-modal="false"
        className="app-time-picker__popup"
        data-placement={overlay.position.placement}
        ref={overlayRef}
        role="dialog"
        style={getAnchoredOverlaySurfaceStyle({
          position: overlay.position,
          hasOverlayHost: Boolean(overlay.overlayHost),
        })}
      >
        <AppTimePanel
          autoFocus={overlay.position.measured}
          maxValue={maxValue}
          minValue={minValue}
          minuteStep={step}
          onAvailabilityChange={setHasAvailableValue}
          onValueChange={setPendingValue}
          readOnly={readOnly}
          value={pendingValue}
        />
        <footer className="app-time-picker__footer">
          <AppButton
            className="app-time-picker__action"
            onClick={cancel}
          >
            {messages.common.cancel}
          </AppButton>
          <AppButton
            appearance="primary"
            className="app-time-picker__action"
            disabled={!canApply}
            onClick={() => {
              if (!canApply) return
              setCommittedValue(pendingValue)
              overlay.requestClose('apply')
            }}
          >
            {messages.common.apply}
          </AppButton>
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
          'app-input-frame',
          resolvedInvalid ? 'app-time-picker--invalid app-input-frame--invalid' : '',
          resolvedDisabled ? 'app-time-picker--disabled app-input-frame--disabled' : '',
          readOnly ? 'app-input-frame--readonly' : '',
          overlay.visible ? 'app-input-frame--active' : '',
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
          onClick={(event) => openPanel(event.currentTarget)}
          onKeyDown={handleDisplayKeyDown}
          ref={displayRef}
          type="button"
        >
          {displayText ?? messages.timePicker.placeholder}
        </button>
        {allowClear && committedValue && !resolvedDisabled && !readOnly ? (
          <button
            aria-label={messages.timePicker.clearLabel}
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
          aria-label={messages.timePicker.openLabel}
          aria-expanded={overlay.visible}
          aria-haspopup="dialog"
          className="app-time-picker__icon-button"
          disabled={resolvedDisabled}
          onClick={(event) => {
            if (overlay.visible) cancel()
            else openPanel(event.currentTarget)
          }}
          ref={timeButtonRef}
          type="button"
        >
          <Clock16Regular aria-hidden="true" focusable="false" />
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
