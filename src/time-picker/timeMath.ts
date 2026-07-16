import type { AppTimeRangeValue, AppTimeValue } from './types'

const MINUTES_PER_DAY = 24 * 60
const warnedSteps = new Set<number>()

export function isValidAppTime(value: AppTimeValue) {
  return (
    Number.isInteger(value.hour) &&
    Number.isInteger(value.minute) &&
    value.hour >= 0 &&
    value.hour <= 23 &&
    value.minute >= 0 &&
    value.minute <= 59
  )
}

export function timeToMinutes(value: AppTimeValue) {
  if (!isValidAppTime(value)) {
    throw new RangeError('Cannot convert an invalid AppTimeValue.')
  }
  return value.hour * 60 + value.minute
}

export function minutesToTime(value: number): AppTimeValue {
  if (
    !Number.isInteger(value) ||
    value < 0 ||
    value >= MINUTES_PER_DAY
  ) {
    throw new RangeError('Minutes must be an integer within the current day.')
  }
  return { hour: Math.floor(value / 60), minute: value % 60 }
}

export function compareAppTimes(first: AppTimeValue, second: AppTimeValue) {
  return timeToMinutes(first) - timeToMinutes(second)
}

export function isSameAppTime(
  first: AppTimeValue | null | undefined,
  second: AppTimeValue | null | undefined,
) {
  return Boolean(first && second && compareAppTimes(first, second) === 0)
}

export function addMinutes(value: AppTimeValue, amount: number) {
  if (!Number.isInteger(amount)) {
    throw new RangeError('Minute adjustment must be an integer.')
  }
  const next = timeToMinutes(value) + amount
  return next < 0 || next >= MINUTES_PER_DAY ? null : minutesToTime(next)
}

export function clampAppTime(
  value: AppTimeValue,
  minValue?: AppTimeValue,
  maxValue?: AppTimeValue,
) {
  if (minValue && maxValue && compareAppTimes(minValue, maxValue) > 0) {
    throw new RangeError('minValue must not be after maxValue.')
  }
  if (minValue && compareAppTimes(value, minValue) < 0) return minValue
  if (maxValue && compareAppTimes(value, maxValue) > 0) return maxValue
  return value
}

export function getTimeRangeDuration(range: AppTimeRangeValue) {
  return timeToMinutes(range.end) - timeToMinutes(range.start)
}

export function isValidTimeRange(range: AppTimeRangeValue) {
  return (
    isValidAppTime(range.start) &&
    isValidAppTime(range.end) &&
    compareAppTimes(range.start, range.end) < 0
  )
}

export function normalizeMinuteStep(value?: number) {
  const resolved =
    value != null &&
    Number.isInteger(value) &&
    value > 0 &&
    60 % value === 0
      ? value
      : 1

  if (
    resolved === 1 &&
    value != null &&
    value !== 1 &&
    import.meta.env.DEV &&
    !warnedSteps.has(value)
  ) {
    warnedSteps.add(value)
    console.warn(
      `Invalid minuteStep ${value}; expected a positive integer that divides 60.`,
    )
  }

  return resolved
}

export function roundTimeToStep(
  value: AppTimeValue,
  minuteStep: number,
) {
  const step = normalizeMinuteStep(minuteStep)
  const rounded = Math.round(timeToMinutes(value) / step) * step
  const latest = MINUTES_PER_DAY - step
  return minutesToTime(Math.min(rounded, latest))
}

export function getCurrentAppTime(): AppTimeValue {
  const now = new Date()
  return { hour: now.getHours(), minute: now.getMinutes() }
}
