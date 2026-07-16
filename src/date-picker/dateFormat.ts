import { isValidAppDate } from './dateMath'
import type { AppDateValue } from './types'

export function formatAppDateISO(value: AppDateValue) {
  if (!isValidAppDate(value) || value.year < 0 || value.year > 9999) {
    throw new RangeError('ISO dates require a valid year from 0000 to 9999.')
  }

  return `${String(value.year).padStart(4, '0')}-${String(value.month).padStart(2, '0')}-${String(value.day).padStart(2, '0')}`
}

export function parseAppDateISO(value: string): AppDateValue | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null

  const parsed = {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  }

  return isValidAppDate(parsed) ? parsed : null
}
