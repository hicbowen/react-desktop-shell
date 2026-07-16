import { isValidAppTime } from './timeMath'
import type { AppTimeValue } from './types'

export function formatAppTimeISO(value: AppTimeValue) {
  if (!isValidAppTime(value)) {
    throw new RangeError('Cannot format an invalid AppTimeValue.')
  }
  return `${String(value.hour).padStart(2, '0')}:${String(value.minute).padStart(2, '0')}`
}

export function parseAppTimeISO(value: string): AppTimeValue | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value)
  if (!match) return null
  const parsed = { hour: Number(match[1]), minute: Number(match[2]) }
  return isValidAppTime(parsed) ? parsed : null
}

export function formatAppTime(
  value: AppTimeValue,
  locale: string,
  hourCycle: 12 | 24,
) {
  if (!isValidAppTime(value)) {
    throw new RangeError('Cannot format an invalid AppTimeValue.')
  }
  const date = new Date(2000, 0, 1, value.hour, value.minute)
  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: hourCycle === 12,
  }).format(date)
}
