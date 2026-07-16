import type { AppDateRangeValue, AppDateValue } from './types'

const DAY_MS = 24 * 60 * 60 * 1000

export function isLeapYear(year: number) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
}

export function getDaysInMonth(year: number, month: number) {
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return 0
  }

  if (month === 2) {
    return isLeapYear(year) ? 29 : 28
  }

  return [4, 6, 9, 11].includes(month) ? 30 : 31
}

export function isValidAppDate(value: AppDateValue) {
  return (
    Number.isFinite(value.year) &&
    Number.isInteger(value.year) &&
    Number.isInteger(value.month) &&
    Number.isInteger(value.day) &&
    value.month >= 1 &&
    value.month <= 12 &&
    value.day >= 1 &&
    value.day <= getDaysInMonth(value.year, value.month)
  )
}

export function compareAppDates(first: AppDateValue, second: AppDateValue) {
  return (
    first.year - second.year ||
    first.month - second.month ||
    first.day - second.day
  )
}

export function isSameAppDate(
  first: AppDateValue | null | undefined,
  second: AppDateValue | null | undefined,
) {
  return Boolean(first && second && compareAppDates(first, second) === 0)
}

function toUTCDate(value: AppDateValue) {
  const date = new Date(0)
  date.setUTCHours(0, 0, 0, 0)
  date.setUTCFullYear(value.year, value.month - 1, value.day)
  return date
}

function fromUTCDate(value: Date): AppDateValue {
  return {
    year: value.getUTCFullYear(),
    month: value.getUTCMonth() + 1,
    day: value.getUTCDate(),
  }
}

function assertIntegerAmount(amount: number) {
  if (!Number.isFinite(amount) || !Number.isInteger(amount)) {
    throw new RangeError('Date adjustment amount must be a finite integer.')
  }
}

export function addDays(value: AppDateValue, amount: number) {
  assertIntegerAmount(amount)
  const date = toUTCDate(value)
  date.setUTCDate(date.getUTCDate() + amount)
  return fromUTCDate(date)
}

export function addMonths(value: AppDateValue, amount: number): AppDateValue {
  assertIntegerAmount(amount)
  const monthIndex = value.year * 12 + (value.month - 1) + amount
  const year = Math.floor(monthIndex / 12)
  const month = ((monthIndex % 12) + 12) % 12 + 1

  return {
    year,
    month,
    day: Math.min(value.day, getDaysInMonth(year, month)),
  }
}

export function addYears(value: AppDateValue, amount: number): AppDateValue {
  assertIntegerAmount(amount)
  const year = value.year + amount
  return {
    year,
    month: value.month,
    day: Math.min(value.day, getDaysInMonth(year, value.month)),
  }
}

export function startOfMonth(value: AppDateValue): AppDateValue {
  return { year: value.year, month: value.month, day: 1 }
}

export function endOfMonth(value: AppDateValue): AppDateValue {
  return {
    year: value.year,
    month: value.month,
    day: getDaysInMonth(value.year, value.month),
  }
}

export function clampAppDate(
  value: AppDateValue,
  minValue?: AppDateValue,
  maxValue?: AppDateValue,
) {
  if (minValue && maxValue && compareAppDates(minValue, maxValue) > 0) {
    throw new RangeError('minValue must not be after maxValue.')
  }
  if (minValue && compareAppDates(value, minValue) < 0) return minValue
  if (maxValue && compareAppDates(value, maxValue) > 0) return maxValue
  return value
}

export function normalizeDateRange(
  first: AppDateValue,
  second: AppDateValue,
): AppDateRangeValue {
  return compareAppDates(first, second) <= 0
    ? { start: first, end: second }
    : { start: second, end: first }
}

export function isDateInRange(
  value: AppDateValue,
  range: AppDateRangeValue,
) {
  const normalized = normalizeDateRange(range.start, range.end)
  return (
    compareAppDates(value, normalized.start) >= 0 &&
    compareAppDates(value, normalized.end) <= 0
  )
}

export function getDateRangeLength(range: AppDateRangeValue) {
  const normalized = normalizeDateRange(range.start, range.end)
  return (
    Math.round(
      (toUTCDate(normalized.end).getTime() -
        toUTCDate(normalized.start).getTime()) /
        DAY_MS,
    ) + 1
  )
}

export function appDateFromDate(value: Date): AppDateValue {
  if (Number.isNaN(value.getTime())) {
    throw new RangeError('Cannot convert an invalid Date.')
  }

  return {
    year: value.getFullYear(),
    month: value.getMonth() + 1,
    day: value.getDate(),
  }
}

export function appDateToLocalDate(value: AppDateValue) {
  if (!isValidAppDate(value)) {
    throw new RangeError('Cannot convert an invalid AppDateValue.')
  }

  const date = new Date(0)
  date.setHours(0, 0, 0, 0)
  date.setFullYear(value.year, value.month - 1, value.day)
  return date
}

export function getTodayAppDate() {
  return appDateFromDate(new Date())
}
