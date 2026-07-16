import type { KeyboardEvent } from 'react'
import { useAppLocale } from '../localization/useAppLocale'
import {
  appDateToLocalDate,
  getTodayAppDate,
  isDateInRange,
  isSameAppDate,
} from './dateMath'
import { formatAppDateISO } from './dateFormat'
import {
  getCalendarMonthDays,
  isCalendarDateDisabled,
} from './calendarMath'
import type {
  AppDateRangeValue,
  AppDateValue,
} from './types'

export interface CalendarDayState {
  value: AppDateValue
  outsideMonth: boolean
  today: boolean
  disabled: boolean
  unavailable: boolean
  selected: boolean
  rangeStart: boolean
  rangeMiddle: boolean
  rangeEnd: boolean
  previewStart: boolean
  previewMiddle: boolean
  previewEnd: boolean
  focused: boolean
}

interface AppCalendarGridProps {
  month: AppDateValue
  focusedDate: AppDateValue
  selectedDate?: AppDateValue | null
  selectedRange?: AppDateRangeValue | null
  previewRange?: AppDateRangeValue | null
  minValue?: AppDateValue
  maxValue?: AppDateValue
  isDateUnavailable?: (value: AppDateValue) => boolean
  showOutsideDays: boolean
  selectionDisabled?: boolean
  onDateSelect: (value: AppDateValue) => void
  onDateHover?: (value: AppDateValue | null) => void
  onDayKeyDown: (
    value: AppDateValue,
    event: KeyboardEvent<HTMLButtonElement>,
  ) => void
}

function getWeekDays(locale: string, firstDayOfWeek: 0 | 1) {
  const shortFormatter = new Intl.DateTimeFormat(locale, { weekday: 'narrow' })
  const longFormatter = new Intl.DateTimeFormat(locale, { weekday: 'long' })
  const sunday = new Date(2024, 0, 7)

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(sunday)
    day.setDate(sunday.getDate() + ((firstDayOfWeek + index) % 7))
    return {
      short: shortFormatter.format(day),
      long: longFormatter.format(day),
    }
  })
}

function rangeState(
  value: AppDateValue,
  range: AppDateRangeValue | null | undefined,
) {
  const start = Boolean(range && isSameAppDate(value, range.start))
  const end = Boolean(range && isSameAppDate(value, range.end))
  const middle = Boolean(range && !start && !end && isDateInRange(value, range))
  return { start, middle, end }
}

export function AppCalendarGrid({
  month,
  focusedDate,
  selectedDate,
  selectedRange,
  previewRange,
  minValue,
  maxValue,
  isDateUnavailable,
  showOutsideDays,
  selectionDisabled = false,
  onDateSelect,
  onDateHover,
  onDayKeyDown,
}: AppCalendarGridProps) {
  const { locale, firstDayOfWeek } = useAppLocale()
  const today = getTodayAppDate()
  const dateLabel = new Intl.DateTimeFormat(locale, {
    dateStyle: 'full',
  })
  const numberFormatter = new Intl.NumberFormat(locale, {
    useGrouping: false,
  })
  const days = getCalendarMonthDays(month, firstDayOfWeek)
  const weekDays = getWeekDays(locale, firstDayOfWeek)

  return (
    <table className="app-calendar__grid" role="grid">
      <thead>
        <tr>
          {weekDays.map((weekDay) => (
            <th abbr={weekDay.long} key={weekDay.long} scope="col">
              {weekDay.short}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: 6 }, (_, weekIndex) => (
          <tr key={weekIndex}>
            {days
              .slice(weekIndex * 7, weekIndex * 7 + 7)
              .map((value) => {
                const outsideMonth =
                  value.year !== month.year || value.month !== month.month
                const unavailable = Boolean(isDateUnavailable?.(value))
                const disabled = isCalendarDateDisabled(
                  value,
                  minValue,
                  maxValue,
                  isDateUnavailable,
                )
                const selectedRangeState = rangeState(value, selectedRange)
                const previewRangeState = rangeState(value, previewRange)
                const selected =
                  isSameAppDate(value, selectedDate) ||
                  Boolean(selectedRange && isDateInRange(value, selectedRange))
                const focused =
                  !outsideMonth && isSameAppDate(value, focusedDate)
                const state: CalendarDayState = {
                  value,
                  outsideMonth,
                  today: isSameAppDate(value, today),
                  disabled,
                  unavailable,
                  selected,
                  rangeStart: selectedRangeState.start,
                  rangeMiddle: selectedRangeState.middle,
                  rangeEnd: selectedRangeState.end,
                  previewStart: previewRangeState.start,
                  previewMiddle: previewRangeState.middle,
                  previewEnd: previewRangeState.end,
                  focused,
                }
                const hidden = outsideMonth && !showOutsideDays
                const classes = [
                  'app-calendar__day',
                  state.outsideMonth ? 'app-calendar__day--outside' : '',
                  hidden ? 'app-calendar__day--hidden' : '',
                  state.selected ? 'app-calendar__day--selected' : '',
                  state.rangeStart ? 'app-calendar__day--range-start' : '',
                  state.rangeMiddle ? 'app-calendar__day--range-middle' : '',
                  state.rangeEnd ? 'app-calendar__day--range-end' : '',
                  state.previewStart ? 'app-calendar__day--preview-start' : '',
                  state.previewMiddle ? 'app-calendar__day--preview-middle' : '',
                  state.previewEnd ? 'app-calendar__day--preview-end' : '',
                ]
                  .filter(Boolean)
                  .join(' ')

                return (
                  <td
                    className={[
                      'app-calendar__cell',
                      state.rangeMiddle
                        ? 'app-calendar__cell--range-middle'
                        : '',
                      state.previewMiddle
                        ? 'app-calendar__cell--preview-middle'
                        : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    key={formatAppDateISO(value)}
                    role="gridcell"
                  >
                    <button
                      aria-current={state.today ? 'date' : undefined}
                      aria-label={dateLabel.format(appDateToLocalDate(value))}
                      aria-selected={state.selected || undefined}
                      className={classes}
                      data-date={formatAppDateISO(value)}
                      disabled={state.disabled || hidden}
                      onClick={() => {
                        if (!selectionDisabled) onDateSelect(value)
                      }}
                      onFocus={() => onDateHover?.(value)}
                      onKeyDown={(event) => onDayKeyDown(value, event)}
                      onMouseEnter={() => {
                        if (!state.disabled) onDateHover?.(value)
                      }}
                      tabIndex={state.focused ? 0 : -1}
                      type="button"
                    >
                      {numberFormatter.format(value.day)}
                    </button>
                  </td>
                )
              })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
