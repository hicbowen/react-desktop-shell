import { useEffect, useId, useRef, type KeyboardEvent } from 'react'
import {
  addDays,
  addMonths,
  addYears,
  appDateToLocalDate,
  startOfMonth,
} from './dateMath'
import { formatAppDateISO } from './dateFormat'
import { AppCalendarGrid } from './AppCalendarGrid'
import {
  findAvailableDate,
  isCalendarDateDisabled,
} from './calendarMath'
import type {
  AppDateRangeValue,
  AppDateValue,
  AppWeekDay,
} from './types'

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
  locale: string
  firstDayOfWeek: AppWeekDay
  showOutsideDays: boolean
  visibleMonths: 1 | 2
  previousMonthLabel: string
  nextMonthLabel: string
  selectionDisabled?: boolean
}

function monthCompare(first: AppDateValue, second: AppDateValue) {
  return first.year - second.year || first.month - second.month
}

function PreviousIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path d="M10.6 2.8a.6.6 0 0 1 0 .85L6.25 8l4.35 4.35a.6.6 0 0 1-.85.85l-4.78-4.78a.6.6 0 0 1 0-.84L9.75 2.8a.6.6 0 0 1 .85 0Z" />
    </svg>
  )
}

function NextIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path d="M5.4 2.8a.6.6 0 0 0 0 .85L9.75 8 5.4 12.35a.6.6 0 1 0 .85.85l4.78-4.78a.6.6 0 0 0 0-.84L6.25 2.8a.6.6 0 0 0-.85 0Z" />
    </svg>
  )
}

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
  locale,
  firstDayOfWeek,
  showOutsideDays,
  visibleMonths,
  previousMonthLabel,
  nextMonthLabel,
  selectionDisabled = false,
}: AppCalendarProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const titleId = useId()
  const firstMonth = startOfMonth(displayedMonth)
  const months = Array.from({ length: visibleMonths }, (_, index) =>
    addMonths(firstMonth, index),
  )
  const monthFormatter = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
  })

  useEffect(() => {
    rootRef.current
      ?.querySelector<HTMLElement>(
        `[data-date="${formatAppDateISO(focusedDate)}"][tabindex="0"]`,
      )
      ?.focus({ preventScroll: true })
  }, [focusedDate, displayedMonth, visibleMonths])

  const setFocusedDate = (next: AppDateValue, step: 1 | -1) => {
    const available = findAvailableDate(
      next,
      step,
      minValue,
      maxValue,
      isDateUnavailable,
    )
    if (!available) return

    const lastMonth = addMonths(firstMonth, visibleMonths - 1)
    if (
      monthCompare(available, firstMonth) < 0 ||
      monthCompare(available, lastMonth) > 0
    ) {
      onDisplayedMonthChange(startOfMonth(available))
    }
    onFocusedDateChange(available)
    onDateHover?.(available)
  }

  const moveMonth = (amount: number) => {
    const nextMonth = addMonths(firstMonth, amount)
    const nextFocused = addMonths(focusedDate, amount)
    onDisplayedMonthChange(nextMonth)
    setFocusedDate(nextFocused, amount < 0 ? -1 : 1)
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
          !isCalendarDateDisabled(
            value,
            minValue,
            maxValue,
            isDateUnavailable,
          )
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
      aria-modal="false"
      aria-readonly={selectionDisabled || undefined}
      className={[
        'app-calendar',
        visibleMonths === 2 ? 'app-calendar--two-months' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onMouseLeave={() => onDateHover?.(null)}
      ref={rootRef}
      role="dialog"
    >
      <header className="app-calendar__header">
        <button
          aria-label={previousMonthLabel}
          className="app-calendar__nav"
          onClick={() => moveMonth(-1)}
          type="button"
        >
          <PreviousIcon />
        </button>
        <div
          aria-live="polite"
          className="app-calendar__titles"
          id={titleId}
        >
          {months.map((month) => (
            <div className="app-calendar__title" key={`${month.year}-${month.month}`}>
              {monthFormatter.format(appDateToLocalDate(month))}
            </div>
          ))}
        </div>
        <button
          aria-label={nextMonthLabel}
          className="app-calendar__nav"
          onClick={() => moveMonth(1)}
          type="button"
        >
          <NextIcon />
        </button>
      </header>
      <div className="app-calendar__months">
        {months.map((month) => (
          <AppCalendarGrid
            firstDayOfWeek={firstDayOfWeek}
            focusedDate={focusedDate}
            isDateUnavailable={isDateUnavailable}
            key={`${month.year}-${month.month}`}
            locale={locale}
            maxValue={maxValue}
            minValue={minValue}
            month={month}
            onDateHover={onDateHover}
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
    </div>
  )
}
