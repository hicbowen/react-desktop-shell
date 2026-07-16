import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import { createPortal } from 'react-dom'
import { useAppFieldContext } from '../field/AppFieldContext'
import { OverlayParentContext } from '../overlay/OverlayTreeContext'
import { getAnchoredOverlaySurfaceStyle } from '../overlay/getAnchoredOverlaySurfaceStyle'
import { AppCalendar } from './AppCalendar'
import { findAvailableDate, isCalendarDateDisabled } from './calendarMath'
import { formatAppDateISO } from './dateFormat'
import {
  appDateToLocalDate,
  clampAppDate,
  compareAppDates,
  getDateRangeLength,
  getTodayAppDate,
  normalizeDateRange,
  startOfMonth,
} from './dateMath'
import type {
  AppDateRangePickerLocale,
  AppDateRangePickerProps,
  AppDateRangeValue,
  AppDateValue,
} from './types'
import { useDatePickerOverlay } from './useDatePickerOverlay'
import './AppDatePicker.css'

type RangeEditTarget = 'start' | 'end'

interface PendingDateRange {
  start: AppDateValue | null
  end: AppDateValue | null
}

const defaultLocaleText: AppDateRangePickerLocale = {
  calendarButtonLabel: 'Open calendar',
  clearButtonLabel: 'Clear date range',
  previousMonthLabel: 'Previous month',
  nextMonthLabel: 'Next month',
  todayLabel: 'Today',
  startPlaceholder: 'Start date',
  endPlaceholder: 'End date',
  cancelLabel: 'Cancel',
  applyLabel: 'Apply',
  selectedDaysLabel: (days) => `${days} selected days`,
}

function CalendarIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path d="M4.5 1a.5.5 0 0 1 .5.5V2h6v-.5a.5.5 0 0 1 1 0V2h.5A1.5 1.5 0 0 1 14 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 12.5v-9A1.5 1.5 0 0 1 3.5 2H4v-.5a.5.5 0 0 1 .5-.5ZM3 6v6.5a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5V6H3Zm.5-3a.5.5 0 0 0-.5.5V5h10V3.5a.5.5 0 0 0-.5-.5H12v.5a.5.5 0 0 1-1 0V3H5v.5a.5.5 0 0 1-1 0V3h-.5Z" />
    </svg>
  )
}

function toPending(value: AppDateRangeValue | null): PendingDateRange {
  return value
    ? { start: value.start, end: value.end }
    : { start: null, end: null }
}

function toCompleteRange(
  pending: PendingDateRange,
): AppDateRangeValue | null {
  return pending.start && pending.end
    ? normalizeDateRange(pending.start, pending.end)
    : null
}

function getInitialDate(
  value: AppDateRangeValue | null,
  target: RangeEditTarget,
  minValue?: AppDateValue,
  maxValue?: AppDateValue,
  isDateUnavailable?: (value: AppDateValue) => boolean,
) {
  const selected = value?.[target]
  const today = clampAppDate(getTodayAppDate(), minValue, maxValue)
  const candidate =
    selected &&
    !isCalendarDateDisabled(
      selected,
      minValue,
      maxValue,
      isDateUnavailable,
    )
      ? selected
      : today

  return (
    findAvailableDate(
      candidate,
      1,
      minValue,
      maxValue,
      isDateUnavailable,
    ) ??
    findAvailableDate(
      candidate,
      -1,
      minValue,
      maxValue,
      isDateUnavailable,
    ) ??
    candidate
  )
}

export function AppDateRangePicker({
  value,
  defaultValue = null,
  onValueChange,
  open,
  defaultOpen = false,
  onOpenChange,
  minValue,
  maxValue,
  isDateUnavailable,
  minDuration,
  maxDuration,
  locale = 'en-US',
  firstDayOfWeek = 0,
  formatValue,
  startPlaceholder,
  endPlaceholder,
  allowClear = false,
  showOutsideDays = true,
  visibleMonths = 'responsive',
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
}: AppDateRangePickerProps) {
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
  const anchorRef = useRef<HTMLDivElement | null>(null)
  const startRef = useRef<HTMLButtonElement | null>(null)
  const calendarButtonRef = useRef<HTMLButtonElement | null>(null)
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const [editTarget, setEditTarget] = useState<RangeEditTarget>('start')
  const [pending, setPending] = useState<PendingDateRange>(() =>
    toPending(committedValue ?? null),
  )
  const [hoveredDate, setHoveredDate] = useState<AppDateValue | null>(null)
  const initialDate = getInitialDate(
    committedValue ?? null,
    editTarget,
    minValue,
    maxValue,
    isDateUnavailable,
  )
  const [focusedDate, setFocusedDate] = useState(initialDate)
  const [displayedMonth, setDisplayedMonth] = useState(
    startOfMonth(initialDate),
  )
  const wasOpenRef = useRef(false)
  const resetPending = () => {
    setPending(toPending(committedValue ?? null))
    setHoveredDate(null)
  }
  const overlay = useDatePickerOverlay({
    open,
    defaultOpen,
    onOpenChange,
    anchorRef,
    overlayRef,
    focusRef: calendarButtonRef,
    onDismiss: resetPending,
    dependencies: [locale, visibleMonths],
  })

  useEffect(() => {
    if (overlay.visible && !wasOpenRef.current) {
      const next = getInitialDate(
        committedValue ?? null,
        editTarget,
        minValue,
        maxValue,
        isDateUnavailable,
      )
      setPending(toPending(committedValue ?? null))
      setHoveredDate(null)
      setFocusedDate(next)
      setDisplayedMonth(startOfMonth(next))
    }
    wasOpenRef.current = overlay.visible
  }, [
    committedValue,
    editTarget,
    isDateUnavailable,
    maxValue,
    minValue,
    overlay.visible,
  ])

  const setCommittedValue = (next: AppDateRangeValue | null) => {
    if (!controlled) setInternalValue(next)
    onValueChange?.(next)
  }
  const formatDate = (date: AppDateValue) =>
    formatValue?.(date, locale) ??
    new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(appDateToLocalDate(date))
  const openFor = (target: RangeEditTarget) => {
    if (resolvedDisabled) return
    setEditTarget(target)
    if (!overlay.visible) {
      setPending(toPending(committedValue ?? null))
      setHoveredDate(null)
    }
    overlay.setVisible(true)
  }
  const cancel = () => {
    resetPending()
    overlay.setVisible(false)
    calendarButtonRef.current?.focus({ preventScroll: true })
  }
  const selectDate = (date: AppDateValue) => {
    if (readOnly) return

    setHoveredDate(null)
    setPending((current) => {
      if (!current.start || (!current.start && !current.end)) {
        setEditTarget('end')
        return { start: date, end: null }
      }

      if (!current.end) {
        const normalized = normalizeDateRange(current.start, date)
        setEditTarget('end')
        return normalized
      }

      if (editTarget === 'start') {
        if (compareAppDates(date, current.end) > 0) {
          setEditTarget('end')
          return { start: date, end: null }
        }
        return { start: date, end: current.end }
      }

      return normalizeDateRange(current.start, date)
    })
  }
  const completePending = toCompleteRange(pending)
  const duration = completePending
    ? getDateRangeLength(completePending)
    : null
  const canApply = Boolean(
    !readOnly &&
      completePending &&
      (minDuration == null || (duration ?? 0) >= minDuration) &&
      (maxDuration == null || (duration ?? 0) <= maxDuration),
  )
  const previewRange =
    pending.start && !pending.end && hoveredDate
      ? normalizeDateRange(pending.start, hoveredDate)
      : null
  const calendarMonths = visibleMonths === 1 ? 1 : 2
  const handleSegmentKeyDown = (
    target: RangeEditTarget,
    event: KeyboardEvent<HTMLButtonElement>,
  ) => {
    if (event.altKey && event.key === 'ArrowDown') {
      event.preventDefault()
      openFor(target)
    }
  }
  const popup = overlay.visible && typeof document !== 'undefined' ? (
    <OverlayParentContext.Provider value={overlay.overlayTree.overlayId}>
      <div
        className={[
          'app-date-picker__popup',
          'app-date-range-picker__popup',
          visibleMonths === 'responsive'
            ? 'app-date-range-picker__popup--responsive'
            : '',
        ]
          .filter(Boolean)
          .join(' ')}
        data-placement={overlay.position.placement}
        ref={overlayRef}
        style={getAnchoredOverlaySurfaceStyle({
          position: overlay.position,
          hasOverlayHost: Boolean(overlay.overlayHost),
        })}
      >
        <AppCalendar
          displayedMonth={displayedMonth}
          firstDayOfWeek={firstDayOfWeek}
          focusedDate={focusedDate}
          isDateUnavailable={isDateUnavailable}
          locale={locale}
          maxValue={maxValue}
          minValue={minValue}
          nextMonthLabel={resolvedLocaleText.nextMonthLabel}
          onDateHover={setHoveredDate}
          onDateSelect={selectDate}
          onDisplayedMonthChange={setDisplayedMonth}
          onFocusedDateChange={setFocusedDate}
          previewRange={previewRange}
          previousMonthLabel={resolvedLocaleText.previousMonthLabel}
          selectedDate={pending.start && !pending.end ? pending.start : null}
          selectedRange={completePending}
          selectionDisabled={readOnly}
          showOutsideDays={showOutsideDays}
          visibleMonths={calendarMonths}
        />
        <footer className="app-date-range-picker__footer">
          <div
            aria-live="polite"
            className="app-date-range-picker__summary"
          >
            {duration
              ? resolvedLocaleText.selectedDaysLabel(duration)
              : null}
          </div>
          <button
            className="app-date-range-picker__action"
            onClick={cancel}
            type="button"
          >
            {resolvedLocaleText.cancelLabel}
          </button>
          <button
            className="app-date-range-picker__action app-date-range-picker__action--primary"
            disabled={!canApply}
            onClick={() => {
              if (!completePending || !canApply) return
              setCommittedValue(completePending)
              overlay.setVisible(false)
              calendarButtonRef.current?.focus({ preventScroll: true })
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
          'app-date-picker',
          'app-date-range-picker',
          resolvedInvalid ? 'app-date-picker--invalid' : '',
          resolvedDisabled ? 'app-date-picker--disabled' : '',
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
            'app-date-range-picker__segment',
            committedValue?.start
              ? ''
              : 'app-date-range-picker__segment--placeholder',
          ]
            .filter(Boolean)
            .join(' ')}
          disabled={resolvedDisabled}
          id={id ?? field?.controlId}
          onClick={() => openFor('start')}
          onKeyDown={(event) => handleSegmentKeyDown('start', event)}
          ref={startRef}
          type="button"
        >
          {committedValue?.start
            ? formatDate(committedValue.start)
            : resolvedStartPlaceholder}
        </button>
        <span aria-hidden="true" className="app-date-range-picker__separator">
          →
        </span>
        <button
          aria-expanded={overlay.visible}
          aria-haspopup="dialog"
          className={[
            'app-date-range-picker__segment',
            committedValue?.end
              ? ''
              : 'app-date-range-picker__segment--placeholder',
          ]
            .filter(Boolean)
            .join(' ')}
          disabled={resolvedDisabled}
          onClick={() => openFor('end')}
          onKeyDown={(event) => handleSegmentKeyDown('end', event)}
          type="button"
        >
          {committedValue?.end
            ? formatDate(committedValue.end)
            : resolvedEndPlaceholder}
        </button>
        {allowClear && committedValue && !resolvedDisabled && !readOnly ? (
          <button
            aria-label={resolvedLocaleText.clearButtonLabel}
            className="app-date-picker__icon-button"
            onClick={() => {
              setCommittedValue(null)
              setPending({ start: null, end: null })
              startRef.current?.focus({ preventScroll: true })
            }}
            type="button"
          >
            <span aria-hidden="true">×</span>
          </button>
        ) : null}
        <button
          aria-label={resolvedLocaleText.calendarButtonLabel}
          aria-expanded={overlay.visible}
          aria-haspopup="dialog"
          className="app-date-picker__icon-button"
          disabled={resolvedDisabled}
          onClick={() => {
            if (overlay.visible) cancel()
            else openFor('start')
          }}
          ref={calendarButtonRef}
          type="button"
        >
          <CalendarIcon />
        </button>
      </div>
      {startName ? (
        <input
          disabled={resolvedDisabled}
          name={startName}
          type="hidden"
          value={
            committedValue ? formatAppDateISO(committedValue.start) : ''
          }
        />
      ) : null}
      {endName ? (
        <input
          disabled={resolvedDisabled}
          name={endName}
          type="hidden"
          value={committedValue ? formatAppDateISO(committedValue.end) : ''}
        />
      ) : null}
      {popup
        ? createPortal(popup, overlay.overlayHost ?? document.body)
        : null}
    </>
  )
}
