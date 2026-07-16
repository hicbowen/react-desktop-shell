import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import { createPortal } from 'react-dom'
import { useAppFieldContext } from '../field/AppFieldContext'
import {
  OverlayParentContext,
} from '../overlay/OverlayTreeContext'
import { OVERLAY_SURFACE_FALLBACK_STYLE } from '../overlay/surfaceFallback'
import { AppCalendar } from './AppCalendar'
import { findAvailableDate, isCalendarDateDisabled } from './calendarMath'
import { formatAppDateISO } from './dateFormat'
import {
  appDateToLocalDate,
  clampAppDate,
  getTodayAppDate,
  startOfMonth,
} from './dateMath'
import type {
  AppDatePickerLocale,
  AppDatePickerProps,
  AppDateValue,
} from './types'
import { useDatePickerOverlay } from './useDatePickerOverlay'
import './AppDatePicker.css'

const defaultLocaleText: AppDatePickerLocale = {
  calendarButtonLabel: 'Open calendar',
  clearButtonLabel: 'Clear date',
  previousMonthLabel: 'Previous month',
  nextMonthLabel: 'Next month',
  todayLabel: 'Today',
}

function CalendarIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path d="M4.5 1a.5.5 0 0 1 .5.5V2h6v-.5a.5.5 0 0 1 1 0V2h.5A1.5 1.5 0 0 1 14 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 12.5v-9A1.5 1.5 0 0 1 3.5 2H4v-.5a.5.5 0 0 1 .5-.5ZM3 6v6.5a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5V6H3Zm.5-3a.5.5 0 0 0-.5.5V5h10V3.5a.5.5 0 0 0-.5-.5H12v.5a.5.5 0 0 1-1 0V3H5v.5a.5.5 0 0 1-1 0V3h-.5Z" />
    </svg>
  )
}

function getInitialDate(
  value: AppDateValue | null,
  minValue?: AppDateValue,
  maxValue?: AppDateValue,
  isDateUnavailable?: (value: AppDateValue) => boolean,
) {
  const today = clampAppDate(getTodayAppDate(), minValue, maxValue)
  const candidate =
    value &&
    !isCalendarDateDisabled(
      value,
      minValue,
      maxValue,
      isDateUnavailable,
    )
      ? value
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

export function AppDatePicker({
  value,
  defaultValue = null,
  onValueChange,
  open,
  defaultOpen = false,
  onOpenChange,
  minValue,
  maxValue,
  isDateUnavailable,
  locale = 'en-US',
  firstDayOfWeek = 0,
  formatValue,
  placeholder = 'Select a date',
  allowClear = false,
  showOutsideDays = true,
  disabled,
  readOnly = false,
  required,
  invalid,
  name,
  id,
  className,
  style,
  localeText,
}: AppDatePickerProps) {
  const field = useAppFieldContext()
  const controlled = value !== undefined
  const [internalValue, setInternalValue] = useState(defaultValue)
  const selectedValue = controlled ? value : internalValue
  const resolvedDisabled = disabled ?? field?.disabled ?? false
  const resolvedRequired = required ?? field?.required
  const resolvedInvalid = invalid ?? field?.invalid
  const resolvedLocaleText = { ...defaultLocaleText, ...localeText }
  const anchorRef = useRef<HTMLDivElement | null>(null)
  const displayRef = useRef<HTMLButtonElement | null>(null)
  const calendarButtonRef = useRef<HTMLButtonElement | null>(null)
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const initialDate = getInitialDate(
    selectedValue ?? null,
    minValue,
    maxValue,
    isDateUnavailable,
  )
  const [focusedDate, setFocusedDate] = useState(initialDate)
  const [displayedMonth, setDisplayedMonth] = useState(
    startOfMonth(initialDate),
  )
  const wasOpenRef = useRef(false)
  const overlay = useDatePickerOverlay({
    open,
    defaultOpen,
    onOpenChange,
    anchorRef,
    overlayRef,
    focusRef: calendarButtonRef,
    dependencies: [locale],
  })

  useEffect(() => {
    if (overlay.visible && !wasOpenRef.current) {
      const next = getInitialDate(
        selectedValue ?? null,
        minValue,
        maxValue,
        isDateUnavailable,
      )
      setFocusedDate(next)
      setDisplayedMonth(startOfMonth(next))
    }
    wasOpenRef.current = overlay.visible
  }, [
    isDateUnavailable,
    maxValue,
    minValue,
    overlay.visible,
    selectedValue,
  ])

  const displayText = selectedValue
    ? formatValue?.(selectedValue, locale) ??
      new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(appDateToLocalDate(selectedValue))
    : null
  const setValue = (next: AppDateValue | null) => {
    if (!controlled) setInternalValue(next)
    onValueChange?.(next)
  }
  const selectDate = (next: AppDateValue) => {
    if (readOnly) return
    setValue(next)
    overlay.setVisible(false)
    calendarButtonRef.current?.focus({ preventScroll: true })
  }
  const openCalendar = () => {
    if (!resolvedDisabled) overlay.setVisible(true)
  }
  const handleDisplayKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.altKey && event.key === 'ArrowDown') {
      event.preventDefault()
      openCalendar()
    }
  }
  const popup = overlay.visible && typeof document !== 'undefined' ? (
    <OverlayParentContext.Provider value={overlay.overlayTree.overlayId}>
      <div
        className="app-date-picker__popup"
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
        <AppCalendar
          displayedMonth={displayedMonth}
          firstDayOfWeek={firstDayOfWeek}
          focusedDate={focusedDate}
          isDateUnavailable={isDateUnavailable}
          locale={locale}
          maxValue={maxValue}
          minValue={minValue}
          nextMonthLabel={resolvedLocaleText.nextMonthLabel}
          onDateSelect={selectDate}
          onDisplayedMonthChange={setDisplayedMonth}
          onFocusedDateChange={setFocusedDate}
          previousMonthLabel={resolvedLocaleText.previousMonthLabel}
          selectedDate={selectedValue}
          selectionDisabled={readOnly}
          showOutsideDays={showOutsideDays}
          visibleMonths={1}
        />
      </div>
    </OverlayParentContext.Provider>
  ) : null

  return (
    <>
      <div
        className={[
          'app-date-picker',
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
            'app-date-picker__display',
            displayText ? '' : 'app-date-picker__display--placeholder',
          ]
            .filter(Boolean)
            .join(' ')}
          disabled={resolvedDisabled}
          id={id ?? field?.controlId}
          onClick={openCalendar}
          onKeyDown={handleDisplayKeyDown}
          ref={displayRef}
          type="button"
        >
          {displayText ?? placeholder}
        </button>
        {allowClear && selectedValue && !resolvedDisabled && !readOnly ? (
          <button
            aria-label={resolvedLocaleText.clearButtonLabel}
            className="app-date-picker__icon-button"
            onClick={() => {
              setValue(null)
              displayRef.current?.focus({ preventScroll: true })
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
          onClick={() => overlay.setVisible(!overlay.visible)}
          ref={calendarButtonRef}
          type="button"
        >
          <CalendarIcon />
        </button>
      </div>
      {name ? (
        <input
          disabled={resolvedDisabled}
          name={name}
          type="hidden"
          value={selectedValue ? formatAppDateISO(selectedValue) : ''}
        />
      ) : null}
      {popup
        ? createPortal(popup, overlay.overlayHost ?? document.body)
        : null}
    </>
  )
}
