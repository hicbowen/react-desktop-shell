import { describe, expect, it, vi } from 'vitest'
import {
  addDays,
  addMonths,
  addYears,
  appDateFromDate,
  appDateToLocalDate,
  clampAppDate,
  compareAppDates,
  endOfMonth,
  getDateRangeLength,
  getDaysInMonth,
  getTodayAppDate,
  isDateInRange,
  isLeapYear,
  isSameAppDate,
  isSelectableDateRange,
  isValidAppDate,
  normalizeDateRange,
  startOfMonth,
} from './dateMath'
import { formatAppDateISO, parseAppDateISO } from './dateFormat'

describe('date value utilities', () => {
  it('validates leap years and month lengths', () => {
    expect(isLeapYear(2000)).toBe(true)
    expect(isLeapYear(1900)).toBe(false)
    expect(isLeapYear(2024)).toBe(true)
    expect(getDaysInMonth(2024, 2)).toBe(29)
    expect(getDaysInMonth(2025, 2)).toBe(28)
    expect(isValidAppDate({ year: 2024, month: 2, day: 29 })).toBe(true)
    expect(isValidAppDate({ year: 2025, month: 2, day: 29 })).toBe(false)
    expect(isValidAppDate({ year: 2025, month: 13, day: 1 })).toBe(false)
  })

  it('adds days across month and year boundaries', () => {
    expect(addDays({ year: 2026, month: 1, day: 31 }, 1)).toEqual({
      year: 2026,
      month: 2,
      day: 1,
    })
    expect(addDays({ year: 2026, month: 12, day: 31 }, 1)).toEqual({
      year: 2027,
      month: 1,
      day: 1,
    })
    expect(addDays({ year: 2026, month: 1, day: 1 }, -1)).toEqual({
      year: 2025,
      month: 12,
      day: 31,
    })
  })

  it('clips dates while adding months and years', () => {
    expect(addMonths({ year: 2024, month: 1, day: 31 }, 1)).toEqual({
      year: 2024,
      month: 2,
      day: 29,
    })
    expect(addMonths({ year: 2026, month: 1, day: 31 }, -2)).toEqual({
      year: 2025,
      month: 11,
      day: 30,
    })
    expect(addYears({ year: 2024, month: 2, day: 29 }, 1)).toEqual({
      year: 2025,
      month: 2,
      day: 28,
    })
  })

  it('compares, clamps, and finds month boundaries', () => {
    const value = { year: 2026, month: 7, day: 16 }
    expect(compareAppDates(value, { ...value, day: 17 })).toBeLessThan(0)
    expect(isSameAppDate(value, { ...value })).toBe(true)
    expect(startOfMonth(value)).toEqual({ year: 2026, month: 7, day: 1 })
    expect(endOfMonth(value)).toEqual({ year: 2026, month: 7, day: 31 })
    expect(
      clampAppDate(
        { year: 2026, month: 6, day: 1 },
        { year: 2026, month: 7, day: 1 },
      ),
    ).toEqual({ year: 2026, month: 7, day: 1 })
  })

  it('normalizes ranges and counts both endpoints', () => {
    const range = normalizeDateRange(
      { year: 2026, month: 7, day: 2 },
      { year: 2026, month: 7, day: 1 },
    )
    expect(range).toEqual({
      start: { year: 2026, month: 7, day: 1 },
      end: { year: 2026, month: 7, day: 2 },
    })
    expect(getDateRangeLength(range)).toBe(2)
    expect(
      getDateRangeLength({
        start: { year: 2026, month: 7, day: 1 },
        end: { year: 2026, month: 7, day: 1 },
      }),
    ).toBe(1)
    expect(isDateInRange({ year: 2026, month: 7, day: 2 }, range)).toBe(true)
  })

  it('validates selectable ranges against endpoints and duration', () => {
    const range = {
      start: { year: 2026, month: 7, day: 10 },
      end: { year: 2026, month: 7, day: 12 },
    }
    expect(
      isSelectableDateRange(range, {
        minValue: { year: 2026, month: 7, day: 1 },
        maxValue: { year: 2026, month: 7, day: 31 },
        minDuration: 3,
        maxDuration: 3,
      }),
    ).toBe(true)
    expect(
      isSelectableDateRange(
        {
          start: { year: 2026, month: 7, day: 12 },
          end: { year: 2026, month: 7, day: 10 },
        },
        {},
      ),
    ).toBe(false)
    expect(
      isSelectableDateRange(
        {
          start: { year: 2026, month: 2, day: 30 },
          end: { year: 2026, month: 3, day: 1 },
        },
        {},
      ),
    ).toBe(false)
    expect(
      isSelectableDateRange(range, {
        isDateUnavailable: (date) => date.day === 12,
      }),
    ).toBe(false)
    expect(
      isSelectableDateRange(range, {
        minValue: { year: 2026, month: 7, day: 11 },
      }),
    ).toBe(false)
    expect(
      isSelectableDateRange(range, {
        maxValue: { year: 2026, month: 7, day: 11 },
      }),
    ).toBe(false)
  })

  it('formats and strictly parses ISO dates', () => {
    expect(formatAppDateISO({ year: 2026, month: 7, day: 16 })).toBe(
      '2026-07-16',
    )
    expect(parseAppDateISO('2026-07-16')).toEqual({
      year: 2026,
      month: 7,
      day: 16,
    })
    expect(parseAppDateISO('2026-02-30')).toBeNull()
    expect(parseAppDateISO('2026-13-01')).toBeNull()
    expect(parseAppDateISO('26-07-16')).toBeNull()
    expect(parseAppDateISO('abc')).toBeNull()
  })

  it('converts Date values through local calendar fields', () => {
    const native = new Date(2026, 6, 16, 15, 30)
    expect(appDateFromDate(native)).toEqual({
      year: 2026,
      month: 7,
      day: 16,
    })
    const restored = appDateToLocalDate({
      year: 2026,
      month: 7,
      day: 16,
    })
    expect(restored.getFullYear()).toBe(2026)
    expect(restored.getMonth()).toBe(6)
    expect(restored.getDate()).toBe(16)
  })

  it('reads today from the local date', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 6, 16, 23, 30))
    expect(getTodayAppDate()).toEqual({
      year: 2026,
      month: 7,
      day: 16,
    })
    vi.useRealTimers()
  })
})
