import {
  addDays,
  clampAppDate,
  compareAppDates,
  startOfMonth,
} from './dateMath'
import type { AppDateValue, AppWeekDay } from './types'

export function getCalendarMonthDays(
  month: AppDateValue,
  firstDayOfWeek: AppWeekDay,
) {
  const first = startOfMonth(month)
  const firstWeekDay = new Date(
    first.year,
    first.month - 1,
    first.day,
  ).getDay()
  const leadingDays = (firstWeekDay - firstDayOfWeek + 7) % 7
  const gridStart = addDays(first, -leadingDays)
  return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index))
}

export function isCalendarDateDisabled(
  value: AppDateValue,
  minValue?: AppDateValue,
  maxValue?: AppDateValue,
  isDateUnavailable?: (value: AppDateValue) => boolean,
) {
  return Boolean(
    (minValue && compareAppDates(value, minValue) < 0) ||
      (maxValue && compareAppDates(value, maxValue) > 0) ||
      isDateUnavailable?.(value),
  )
}

export function findAvailableDate(
  initial: AppDateValue,
  step: 1 | -1,
  minValue?: AppDateValue,
  maxValue?: AppDateValue,
  isDateUnavailable?: (value: AppDateValue) => boolean,
) {
  let candidate = clampAppDate(initial, minValue, maxValue)

  for (let attempts = 0; attempts < 3660; attempts += 1) {
    if (
      !isCalendarDateDisabled(
        candidate,
        minValue,
        maxValue,
        isDateUnavailable,
      )
    ) {
      return candidate
    }

    const next = addDays(candidate, step)
    if (
      (minValue && compareAppDates(next, minValue) < 0) ||
      (maxValue && compareAppDates(next, maxValue) > 0)
    ) {
      break
    }
    candidate = next
  }

  return null
}
