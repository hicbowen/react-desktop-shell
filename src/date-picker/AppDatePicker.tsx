import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import { createPortal } from 'react-dom'
import { CalendarLtr16Regular } from '@fluentui/react-icons/svg/calendar-ltr'
import { useAppFieldContext } from '../field/AppFieldContext'
import { useAppLocale } from '../localization/useAppLocale'
import {
  OverlayParentContext,
} from '../overlay/OverlayTreeContext'
import { getAnchoredOverlaySurfaceStyle } from '../overlay/getAnchoredOverlaySurfaceStyle'
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
  AppDatePickerProps,
  AppDateValue,
} from './types'
import { useDatePickerOverlay } from './useDatePickerOverlay'
import './AppDatePicker.css'

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
}: AppDatePickerProps) {
  const field = useAppFieldContext()
  const { locale, messages } = useAppLocale()
  const controlled = value !== undefined
  const [internalValue, setInternalValue] = useState(defaultValue)
  const selectedValue = controlled ? value : internalValue
  const resolvedDisabled = disabled ?? field?.disabled ?? false
  const resolvedRequired = required ?? field?.required
  const resolvedInvalid = invalid ?? field?.invalid
  const anchorRef = useRef<HTMLDivElement | null>(null)
  const displayRef = useRef<HTMLButtonElement | null>(null)
  const calendarButtonRef = useRef<HTMLButtonElement | null>(null)
  const openerRef = useRef<HTMLElement | null>(null)
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
    onAfterClose: () =>
      (openerRef.current ?? calendarButtonRef.current)?.focus({
        preventScroll: true,
      }),
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
    ? new Intl.DateTimeFormat(locale, {
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
    overlay.requestClose('apply')
  }
  const openCalendar = (opener: HTMLElement) => {
    if (!resolvedDisabled) {
      openerRef.current = opener
      overlay.setVisible(true)
    }
  }
  const handleDisplayKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.altKey && event.key === 'ArrowDown') {
      event.preventDefault()
      openCalendar(event.currentTarget)
    }
  }
  const popup = overlay.visible && typeof document !== 'undefined' ? (
    <OverlayParentContext.Provider value={overlay.overlayTree.overlayId}>
      <div
        className="app-date-picker__popup"
        data-placement={overlay.position.placement}
        ref={overlayRef}
        style={getAnchoredOverlaySurfaceStyle({
          position: overlay.position,
          hasOverlayHost: Boolean(overlay.overlayHost),
        })}
      >
        <AppCalendar
          dialogLabel={messages.datePicker.dialogLabel}
          displayedMonth={displayedMonth}
          focusedDate={focusedDate}
          isDateUnavailable={isDateUnavailable}
          maxValue={maxValue}
          minValue={minValue}
          onDateSelect={selectDate}
          onDisplayedMonthChange={setDisplayedMonth}
          onFocusedDateChange={setFocusedDate}
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
          onClick={(event) => openCalendar(event.currentTarget)}
          onKeyDown={handleDisplayKeyDown}
          ref={displayRef}
          type="button"
        >
          {displayText ?? messages.datePicker.placeholder}
        </button>
        {allowClear && selectedValue && !resolvedDisabled && !readOnly ? (
          <button
            aria-label={messages.datePicker.clearLabel}
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
          aria-label={messages.datePicker.openLabel}
          aria-expanded={overlay.visible}
          aria-haspopup="dialog"
          className="app-date-picker__icon-button"
          disabled={resolvedDisabled}
          onClick={(event) => {
            if (overlay.visible) overlay.requestClose('trigger')
            else openCalendar(event.currentTarget)
          }}
          ref={calendarButtonRef}
          type="button"
        >
          <CalendarLtr16Regular aria-hidden="true" focusable="false" />
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
