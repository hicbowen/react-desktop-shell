import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
} from 'react'
import { ChevronLeft16Regular } from '@fluentui/react-icons/svg/chevron-left'
import { ChevronRight16Regular } from '@fluentui/react-icons/svg/chevron-right'
import { useAppLocale } from '../localization/useAppLocale'
import {
  addDays,
  addMonths,
  addYears,
  appDateToLocalDate,
  clampAppDate,
  endOfMonth,
  getDaysInMonth,
  startOfMonth,
} from './dateMath'
import { formatAppDateISO } from './dateFormat'
import { AppCalendarGrid } from './AppCalendarGrid'
import {
  AppCalendarMonthNavigation,
  type CalendarMonthNavigation,
} from './AppCalendarMonthNavigation'
import { findAvailableDate, isCalendarDateDisabled } from './calendarMath'
import type { AppDateRangeValue, AppDateValue } from './types'

export interface AppCalendarProps {
  focusedDate: AppDateValue
  onFocusedDateChange: (value: AppDateValue) => void
  displayedMonth: AppDateValue
  onDisplayedMonthChange: (value: AppDateValue) => void
  selectedDate?: AppDateValue | null
  selectedRange?: AppDateRangeValue | null
  previewRange?: AppDateRangeValue | null
  onDateSelect: (value: AppDateValue) => void
  onDateHover?: (value: AppDateValue | null) => void
  minValue?: AppDateValue
  maxValue?: AppDateValue
  isDateUnavailable?: (value: AppDateValue) => boolean
  showOutsideDays: boolean
  visibleMonths: 1 | 2
  dialogLabel: string
  navigationCancelRef?: RefObject<(() => void) | null>
  selectionDisabled?: boolean
  role?: 'dialog' | 'group'
}

function monthCompare(first: AppDateValue, second: AppDateValue) {
  return first.year - second.year || first.month - second.month
}

const MIN_CALENDAR_DATE = { year: 0, month: 1, day: 1 }
const MAX_CALENDAR_DATE = { year: 9999, month: 12, day: 31 }

export function AppCalendar({
  focusedDate,
  onFocusedDateChange,
  displayedMonth,
  onDisplayedMonthChange,
  selectedDate,
  selectedRange,
  previewRange,
  onDateSelect,
  onDateHover,
  minValue,
  maxValue,
  isDateUnavailable,
  showOutsideDays,
  visibleMonths,
  dialogLabel,
  navigationCancelRef,
  selectionDisabled = false,
  role = 'dialog',
}: AppCalendarProps) {
  const { locale, messages, firstDayOfWeek } = useAppLocale()
  const rootRef = useRef<HTMLDivElement | null>(null)
  const monthButtonRef = useRef<HTMLButtonElement>(null)
  const yearButtonRef = useRef<HTMLButtonElement>(null)
  const returnFocus = useRef<'month' | 'year' | null>(null)
  const suppressDateHover = useRef(false)
  const [navigation, setNavigation] = useState<CalendarMonthNavigation | null>(null)
  const titleId = useId()
  const navigationId = useId()
  const minDate = minValue ?? MIN_CALENDAR_DATE
  const maxDate = maxValue ?? MAX_CALENDAR_DATE
  const earliestMonth = startOfMonth(minDate)
  const latestMonth = startOfMonth(maxDate)
  const latestStart = addMonths(latestMonth, 1 - visibleMonths)
  const lastSupportedStart = addMonths(
    startOfMonth(MAX_CALENDAR_DATE),
    1 - visibleMonths,
  )
  const earliestStart = clampAppDate(earliestMonth, undefined, lastSupportedStart)
  const latestFirstMonth = clampAppDate(latestStart, earliestStart)
  const getWindowStart = (month: AppDateValue) =>
    clampAppDate(startOfMonth(month), earliestStart, latestFirstMonth)
  const firstMonth = getWindowStart(displayedMonth)
  const months = Array.from({ length: visibleMonths }, (_, index) =>
    addMonths(firstMonth, index),
  )
  const canMovePrevious = monthCompare(firstMonth, earliestStart) > 0
  const canMoveNext = monthCompare(firstMonth, latestFirstMonth) < 0
  const monthFormatter = new Intl.DateTimeFormat(locale, {
    calendar: 'gregory',
    year: 'numeric',
    month: 'long',
  })
  const yearFormatter = new Intl.NumberFormat(locale, { useGrouping: false })
  const navigationYear =
    navigation &&
    Math.max(earliestMonth.year, Math.min(navigation.year, latestMonth.year))
  const headerMonth =
    navigationYear === null ? firstMonth : { ...firstMonth, year: navigationYear }

  useEffect(() => {
    if (navigation) return
    const target = returnFocus.current
    returnFocus.current = null
    if (target) {
      ;(target === 'year' ? yearButtonRef : monthButtonRef).current?.focus({
        preventScroll: true,
      })
    } else {
      rootRef.current
        ?.querySelector<HTMLElement>(
          `[data-date="${formatAppDateISO(focusedDate)}"][tabindex="0"]:not(:disabled)`,
        )
        ?.focus({ preventScroll: true })
    }
    suppressDateHover.current = false
  }, [focusedDate, displayedMonth, visibleMonths, navigation])

  const closeNavigation = useCallback(() => {
    if (!navigation) return
    returnFocus.current = navigation.mode
    setNavigation(null)
  }, [navigation])

  useEffect(() => {
    if (!navigationCancelRef || !navigation) return
    navigationCancelRef.current = closeNavigation
    return () => {
      navigationCancelRef.current = null
    }
  }, [closeNavigation, navigation, navigationCancelRef])

  const openNavigation = (mode: CalendarMonthNavigation['mode']) => {
    if (navigation?.mode === mode) {
      closeNavigation()
      return
    }
    onDateHover?.(null)
    setNavigation({ mode, year: navigationYear ?? firstMonth.year })
  }

  const navigateToMonth = (
    month: AppDateValue,
    preferred: AppDateValue,
    last = month,
    step: 1 | -1 = 1,
  ) => {
    const earliest = clampAppDate(month, minDate, maxDate)
    const latest = clampAppDate(endOfMonth(last), minDate, maxDate)
    const candidate = clampAppDate(preferred, earliest, latest)
    const available =
      findAvailableDate(candidate, step, earliest, latest, isDateUnavailable) ??
      findAvailableDate(
        candidate,
        step === 1 ? -1 : 1,
        earliest,
        latest,
        isDateUnavailable,
      )
    const nextMonth = getWindowStart(month)
    if (monthCompare(nextMonth, displayedMonth) !== 0) onDisplayedMonthChange(nextMonth)
    onFocusedDateChange(available ?? candidate)
    return available
  }

  const chooseMonth = (month: AppDateValue) => {
    const day = Math.min(focusedDate.day, getDaysInMonth(month.year, month.month))
    suppressDateHover.current = true
    if (!navigateToMonth(month, { ...month, day })) returnFocus.current = 'month'
    setNavigation(null)
  }

  const setFocusedDate = (next: AppDateValue, step: 1 | -1) => {
    const available = findAvailableDate(next, step, minDate, maxDate, isDateUnavailable)
    if (!available) return

    const lastMonth = addMonths(firstMonth, visibleMonths - 1)
    if (
      monthCompare(available, firstMonth) < 0 ||
      monthCompare(available, lastMonth) > 0
    ) {
      onDisplayedMonthChange(getWindowStart(available))
    }
    onFocusedDateChange(available)
    onDateHover?.(available)
  }

  const moveMonth = (amount: number) => {
    if ((amount < 0 && !canMovePrevious) || (amount > 0 && !canMoveNext)) {
      return
    }

    const nextMonth = addMonths(firstMonth, amount)
    const nextFocused = addMonths(focusedDate, amount)
    navigateToMonth(
      nextMonth,
      nextFocused,
      addMonths(nextMonth, visibleMonths - 1),
      amount < 0 ? -1 : 1,
    )
  }

  const handleDayKeyDown = (
    value: AppDateValue,
    event: KeyboardEvent<HTMLButtonElement>,
  ) => {
    let next: AppDateValue | null = null
    let step: 1 | -1 = 1

    switch (event.key) {
      case 'ArrowLeft':
        next = addDays(value, -1)
        step = -1
        break
      case 'ArrowRight':
        next = addDays(value, 1)
        break
      case 'ArrowUp':
        next = addDays(value, -7)
        step = -1
        break
      case 'ArrowDown':
        next = addDays(value, 7)
        break
      case 'Home': {
        const weekDay = appDateToLocalDate(value).getDay()
        next = addDays(value, -((weekDay - firstDayOfWeek + 7) % 7))
        step = -1
        break
      }
      case 'End': {
        const weekDay = appDateToLocalDate(value).getDay()
        next = addDays(value, 6 - ((weekDay - firstDayOfWeek + 7) % 7))
        break
      }
      case 'PageUp':
        next = event.shiftKey ? addYears(value, -1) : addMonths(value, -1)
        step = -1
        break
      case 'PageDown':
        next = event.shiftKey ? addYears(value, 1) : addMonths(value, 1)
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (
          !selectionDisabled &&
          !isCalendarDateDisabled(value, minValue, maxValue, isDateUnavailable)
        ) {
          onDateSelect(value)
        }
        return
      default:
        return
    }

    event.preventDefault()
    if (next) setFocusedDate(next, step)
  }

  return (
    <div
      aria-labelledby={titleId}
      aria-modal={role === 'dialog' ? 'false' : undefined}
      aria-readonly={selectionDisabled || undefined}
      className={['app-calendar', visibleMonths === 2 ? 'app-calendar--two-months' : '']
        .filter(Boolean)
        .join(' ')}
      onMouseLeave={() => onDateHover?.(null)}
      onKeyDown={(event) => {
        if (navigation && event.key === 'Escape' && !event.defaultPrevented) {
          event.preventDefault()
          closeNavigation()
        }
      }}
      ref={rootRef}
      role={role}
    >
      <div aria-live="polite" className="app-calendar__dialog-label" id={titleId}>
        {dialogLabel} ·{' '}
        {months
          .map((month) => monthFormatter.format(appDateToLocalDate(month)))
          .join(' · ')}
      </div>
      <header
        className="app-calendar__header"
        data-choosing={navigation ? true : undefined}
      >
        <button
          aria-label={messages.datePicker.previousMonthLabel}
          className="app-calendar__nav"
          disabled={Boolean(navigation) || !canMovePrevious}
          onClick={() => moveMonth(-1)}
          type="button"
        >
          <ChevronLeft16Regular aria-hidden="true" focusable="false" />
        </button>
        <div className="app-calendar__titles">
          <div className="app-calendar__title">
            {monthFormatter
              .formatToParts(appDateToLocalDate(headerMonth))
              .map((part, index) => {
                if (part.type !== 'year' && part.type !== 'month') return part.value
                const mode = part.type
                const label =
                  mode === 'year' ? yearFormatter.format(headerMonth.year) : part.value
                const action =
                  mode === 'year'
                    ? messages.datePicker.chooseYear
                    : messages.datePicker.chooseMonth
                return (
                  <button
                    aria-controls={navigation?.mode === mode ? navigationId : undefined}
                    aria-expanded={navigation?.mode === mode}
                    aria-label={`${action} · ${label}`}
                    className="app-calendar__title-button"
                    key={index}
                    onClick={() => openNavigation(mode)}
                    ref={mode === 'year' ? yearButtonRef : monthButtonRef}
                    type="button"
                  >
                    {label}
                  </button>
                )
              })}
          </div>
          {months[1] && !navigation && (
            <div className="app-calendar__title">
              {monthFormatter.format(appDateToLocalDate(months[1]))}
            </div>
          )}
        </div>
        <button
          aria-label={messages.datePicker.nextMonthLabel}
          className="app-calendar__nav"
          disabled={Boolean(navigation) || !canMoveNext}
          onClick={() => moveMonth(1)}
          type="button"
        >
          <ChevronRight16Regular aria-hidden="true" focusable="false" />
        </button>
      </header>
      {navigation ? (
        <AppCalendarMonthNavigation
          displayedMonth={firstMonth}
          earliestMonth={earliestMonth}
          id={navigationId}
          key={navigation.mode}
          latestMonth={latestMonth}
          navigation={{ mode: navigation.mode, year: headerMonth.year }}
          onBack={closeNavigation}
          onChooseMonth={chooseMonth}
          onChooseYear={(year) => setNavigation({ mode: 'month', year })}
        />
      ) : (
        <div className="app-calendar__months">
          {months.map((month) => (
            <AppCalendarGrid
              focusedDate={focusedDate}
              isDateUnavailable={isDateUnavailable}
              key={`${month.year}-${month.month}`}
              maxValue={maxValue}
              minValue={minValue}
              month={month}
              onDateHover={
                onDateHover &&
                ((value) => {
                  if (!suppressDateHover.current) onDateHover(value)
                })
              }
              onDateSelect={onDateSelect}
              onDayKeyDown={handleDayKeyDown}
              previewRange={previewRange}
              selectedDate={selectedDate}
              selectedRange={selectedRange}
              selectionDisabled={selectionDisabled}
              showOutsideDays={showOutsideDays}
            />
          ))}
        </div>
      )}
    </div>
  )
}
