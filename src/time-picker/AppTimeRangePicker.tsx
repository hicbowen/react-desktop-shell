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
import { getAnchoredOverlaySurfaceStyle } from '../overlay/getAnchoredOverlaySurfaceStyle'
import { AppTimePanel } from './AppTimePanel'
import { formatAppTime, formatAppTimeISO } from './timeFormat'
import {
  addMinutes,
  compareAppTimes,
  getCurrentAppTime,
  getTimeRangeDuration,
  hasAvailableTimeValue,
  isTimeAlignedToStep,
  isValidAppTime,
  isValidTimeRange,
  normalizeTimeRangeToStep,
  normalizeTimeToStep,
  normalizeMinuteStep,
} from './timeMath'
import type {
  AppTimeRangePickerLocale,
  AppTimeRangePickerProps,
  AppTimeRangeValue,
  AppTimeValue,
} from './types'
import { useTimePickerOverlay } from './useTimePickerOverlay'
import './AppTimePicker.css'

type TimeRangeEditTarget = 'start' | 'end'

const defaultLocaleText: AppTimeRangePickerLocale = {
  timeButtonLabel: 'Open time range picker',
  dialogLabel: 'Choose a time range',
  clearButtonLabel: 'Clear time range',
  hourLabel: 'Hour',
  minuteLabel: 'Minute',
  cancelLabel: 'Cancel',
  applyLabel: 'Apply',
  noAvailableTimeLabel: 'No available times',
  startLabel: 'Start time',
  endLabel: 'End time',
  startPlaceholder: 'Start time',
  endPlaceholder: 'End time',
  durationLabel: (minutes) => `${minutes} minutes`,
  invalidRangeLabel: 'End time must be later than start time',
}

function TimeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path d="M8 1.5A6.5 6.5 0 1 1 1.5 8 6.5 6.5 0 0 1 8 1.5Zm0 1A5.5 5.5 0 1 0 13.5 8 5.5 5.5 0 0 0 8 2.5Zm0 2a.5.5 0 0 1 .5.5v2.79l1.85 1.06a.5.5 0 1 1-.5.87l-2.1-1.22A.5.5 0 0 1 7.5 8V5a.5.5 0 0 1 .5-.5Z" />
    </svg>
  )
}

function initialStart(
  step: number,
  minValue?: AppTimeValue,
  maxValue?: AppTimeValue,
) {
  return normalizeTimeToStep(
    getCurrentAppTime(),
    step,
    minValue,
    maxValue,
  )
}

function initialRange(
  value: AppTimeRangeValue | null,
  step: number,
  minValue?: AppTimeValue,
  maxValue?: AppTimeValue,
) {
  if (value) {
    return normalizeTimeRangeToStep(value, step, minValue, maxValue)
  }
  const start = initialStart(step, minValue, maxValue)
  const oneHour = addMinutes(start, 60)
  if (
    oneHour &&
    (!maxValue || compareAppTimes(oneHour, maxValue) <= 0)
  ) {
    return { start, end: oneHour }
  }
  const oneStep = addMinutes(start, step)
  if (
    oneStep &&
    (!maxValue || compareAppTimes(oneStep, maxValue) <= 0)
  ) {
    return { start, end: oneStep }
  }
  return { start, end: start }
}

export function AppTimeRangePicker({
  value,
  defaultValue = null,
  onValueChange,
  open,
  defaultOpen = false,
  onOpenChange,
  minValue,
  maxValue,
  minuteStep,
  minDuration,
  maxDuration,
  hourCycle = 24,
  locale = 'en-US',
  startPlaceholder,
  endPlaceholder,
  allowClear = false,
  disabled,
  readOnly = false,
  required,
  invalid,
  startName,
  endName,
  id,
  className,
  style,
  localeText,
}: AppTimeRangePickerProps) {
  const field = useAppFieldContext()
  const controlled = value !== undefined
  const [internalValue, setInternalValue] = useState(defaultValue)
  const committedValue = controlled ? value : internalValue
  const resolvedDisabled = disabled ?? field?.disabled ?? false
  const resolvedRequired = required ?? field?.required
  const resolvedInvalid = invalid ?? field?.invalid
  const resolvedLocaleText = { ...defaultLocaleText, ...localeText }
  const resolvedStartPlaceholder =
    startPlaceholder ?? resolvedLocaleText.startPlaceholder
  const resolvedEndPlaceholder =
    endPlaceholder ?? resolvedLocaleText.endPlaceholder
  const step = normalizeMinuteStep(minuteStep)
  const anchorRef = useRef<HTMLDivElement | null>(null)
  const startRef = useRef<HTMLButtonElement | null>(null)
  const endRef = useRef<HTMLButtonElement | null>(null)
  const timeButtonRef = useRef<HTMLButtonElement | null>(null)
  const openerRef = useRef<HTMLElement | null>(null)
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const [editTarget, setEditTarget] =
    useState<TimeRangeEditTarget>('start')
  const [pending, setPending] = useState(() =>
    initialRange(committedValue ?? null, step, minValue, maxValue),
  )
  const [hasAvailableValue, setHasAvailableValue] = useState(() =>
    hasAvailableTimeValue(step, minValue, maxValue),
  )
  const wasOpenRef = useRef(false)
  const resetPending = useCallback(
    () =>
      setPending(
        initialRange(committedValue ?? null, step, minValue, maxValue),
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

  const setCommittedValue = (next: AppTimeRangeValue | null) => {
    if (!controlled) setInternalValue(next)
    onValueChange?.(next)
  }
  const formatTime = (time: AppTimeValue) =>
    formatAppTime(time, locale, hourCycle)
  const openFor = (
    target: TimeRangeEditTarget,
    opener: HTMLElement,
  ) => {
    if (resolvedDisabled) return
    openerRef.current = opener
    setEditTarget(target)
    if (!overlay.visible) resetPending()
    overlay.setVisible(true)
  }
  const cancel = () => {
    overlay.requestClose('cancel')
  }
  const duration = isValidTimeRange(pending)
    ? getTimeRangeDuration(pending)
    : null
  const canApply = Boolean(
    !readOnly &&
      hasAvailableValue &&
      isValidAppTime(pending.start) &&
      isValidAppTime(pending.end) &&
      isTimeAlignedToStep(pending.start, step) &&
      isTimeAlignedToStep(pending.end, step) &&
      duration != null &&
      (minDuration == null || duration >= minDuration) &&
      (maxDuration == null || duration <= maxDuration) &&
      (!minValue || compareAppTimes(pending.start, minValue) >= 0) &&
      (!maxValue || compareAppTimes(pending.end, maxValue) <= 0),
  )
  const handleSegmentKeyDown = (
    target: TimeRangeEditTarget,
    event: KeyboardEvent<HTMLButtonElement>,
  ) => {
    if (event.altKey && event.key === 'ArrowDown') {
      event.preventDefault()
      openFor(target, event.currentTarget)
    }
  }
  const popup = overlay.visible && typeof document !== 'undefined' ? (
    <OverlayParentContext.Provider value={overlay.overlayTree.overlayId}>
      <div
        aria-label={resolvedLocaleText.dialogLabel}
        aria-modal="false"
        className="app-time-picker__popup app-time-range-picker__popup"
        data-placement={overlay.position.placement}
        ref={overlayRef}
        role="dialog"
        style={getAnchoredOverlaySurfaceStyle({
          position: overlay.position,
          hasOverlayHost: Boolean(overlay.overlayHost),
        })}
      >
        <div
          aria-label="Time range part"
          className="app-time-range-picker__tabs"
          role="group"
        >
          <button
            aria-pressed={editTarget === 'start'}
            onClick={() => setEditTarget('start')}
            type="button"
          >
            {resolvedLocaleText.startLabel}
          </button>
          <button
            aria-pressed={editTarget === 'end'}
            onClick={() => setEditTarget('end')}
            type="button"
          >
            {resolvedLocaleText.endLabel}
          </button>
        </div>
        <AppTimePanel
          autoFocus={overlay.position.measured}
          hourCycle={hourCycle}
          hourLabel={resolvedLocaleText.hourLabel}
          locale={locale}
          maxValue={maxValue}
          minValue={minValue}
          minuteLabel={resolvedLocaleText.minuteLabel}
          minuteStep={step}
          noAvailableTimeLabel={resolvedLocaleText.noAvailableTimeLabel}
          onAvailabilityChange={setHasAvailableValue}
          onValueChange={(next) =>
            setPending((current) => ({
              ...current,
              [editTarget]: next,
            }))
          }
          readOnly={readOnly}
          value={pending[editTarget]}
        />
        <footer className="app-time-picker__footer">
          <div
            aria-live="polite"
            className={[
              'app-time-range-picker__summary',
              duration == null
                ? 'app-time-range-picker__summary--invalid'
                : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {duration == null
              ? resolvedLocaleText.invalidRangeLabel
              : resolvedLocaleText.durationLabel(duration)}
          </div>
          <button
            className="app-time-picker__action"
            onClick={cancel}
            type="button"
          >
            {resolvedLocaleText.cancelLabel}
          </button>
          <button
            className="app-time-picker__action app-time-picker__action--primary"
            disabled={!canApply}
            onClick={() => {
              if (!canApply) return
              setCommittedValue(pending)
              overlay.requestClose('apply')
            }}
            type="button"
          >
            {resolvedLocaleText.applyLabel}
          </button>
        </footer>
      </div>
    </OverlayParentContext.Provider>
  ) : null

  return (
    <>
      <div
        className={[
          'app-time-picker',
          'app-time-range-picker',
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
            'app-time-range-picker__segment',
            committedValue?.start
              ? ''
              : 'app-time-range-picker__segment--placeholder',
          ]
            .filter(Boolean)
            .join(' ')}
          disabled={resolvedDisabled}
          id={id ?? field?.controlId}
          onClick={(event) => openFor('start', event.currentTarget)}
          onKeyDown={(event) => handleSegmentKeyDown('start', event)}
          ref={startRef}
          type="button"
        >
          {committedValue?.start
            ? formatTime(committedValue.start)
            : resolvedStartPlaceholder}
        </button>
        <span aria-hidden="true" className="app-time-range-picker__separator">
          →
        </span>
        <button
          aria-expanded={overlay.visible}
          aria-haspopup="dialog"
          className={[
            'app-time-range-picker__segment',
            committedValue?.end
              ? ''
              : 'app-time-range-picker__segment--placeholder',
          ]
            .filter(Boolean)
            .join(' ')}
          disabled={resolvedDisabled}
          onClick={(event) => openFor('end', event.currentTarget)}
          onKeyDown={(event) => handleSegmentKeyDown('end', event)}
          ref={endRef}
          type="button"
        >
          {committedValue?.end
            ? formatTime(committedValue.end)
            : resolvedEndPlaceholder}
        </button>
        {allowClear && committedValue && !resolvedDisabled && !readOnly ? (
          <button
            aria-label={resolvedLocaleText.clearButtonLabel}
            className="app-time-picker__icon-button"
            onClick={() => {
              setCommittedValue(null)
              startRef.current?.focus({ preventScroll: true })
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
          onClick={(event) => {
            if (overlay.visible) cancel()
            else openFor('start', event.currentTarget)
          }}
          ref={timeButtonRef}
          type="button"
        >
          <TimeIcon />
        </button>
      </div>
      {startName ? (
        <input
          disabled={resolvedDisabled}
          name={startName}
          type="hidden"
          value={
            committedValue ? formatAppTimeISO(committedValue.start) : ''
          }
        />
      ) : null}
      {endName ? (
        <input
          disabled={resolvedDisabled}
          name={endName}
          type="hidden"
          value={committedValue ? formatAppTimeISO(committedValue.end) : ''}
        />
      ) : null}
      {popup
        ? createPortal(popup, overlay.overlayHost ?? document.body)
        : null}
    </>
  )
}
