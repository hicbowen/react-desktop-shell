import { afterEach, describe, expect, it, vi } from 'vitest'
import { formatAppTime, formatAppTimeISO, parseAppTimeISO } from './timeFormat'
import {
  addMinutes,
  clampAppTime,
  compareAppTimes,
  getCurrentAppTime,
  getTimeRangeDuration,
  isSameAppTime,
  isValidAppTime,
  isValidTimeRange,
  minutesToTime,
  normalizeMinuteStep,
  roundTimeToStep,
  timeToMinutes,
} from './timeMath'

describe('time value utilities', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('validates the full day and rejects invalid fields', () => {
    expect(isValidAppTime({ hour: 0, minute: 0 })).toBe(true)
    expect(isValidAppTime({ hour: 23, minute: 59 })).toBe(true)
    expect(isValidAppTime({ hour: 24, minute: 0 })).toBe(false)
    expect(isValidAppTime({ hour: 12, minute: 60 })).toBe(false)
    expect(isValidAppTime({ hour: 12.5, minute: 30 })).toBe(false)
  })

  it('strictly parses and formats HH:mm', () => {
    expect(formatAppTimeISO({ hour: 9, minute: 5 })).toBe('09:05')
    expect(parseAppTimeISO('18:30')).toEqual({ hour: 18, minute: 30 })
    expect(parseAppTimeISO('9:30')).toBeNull()
    expect(parseAppTimeISO('24:00')).toBeNull()
    expect(parseAppTimeISO('12:60')).toBeNull()
    expect(parseAppTimeISO('abc')).toBeNull()
  })

  it('compares and converts minute values', () => {
    expect(timeToMinutes({ hour: 10, minute: 30 })).toBe(630)
    expect(minutesToTime(630)).toEqual({ hour: 10, minute: 30 })
    expect(
      compareAppTimes(
        { hour: 9, minute: 0 },
        { hour: 10, minute: 0 },
      ),
    ).toBeLessThan(0)
    expect(
      isSameAppTime({ hour: 9, minute: 0 }, { hour: 9, minute: 0 }),
    ).toBe(true)
  })

  it('adds minutes without crossing the day boundary', () => {
    expect(addMinutes({ hour: 9, minute: 30 }, 60)).toEqual({
      hour: 10,
      minute: 30,
    })
    expect(addMinutes({ hour: 0, minute: 15 }, -15)).toEqual({
      hour: 0,
      minute: 0,
    })
    expect(addMinutes({ hour: 23, minute: 30 }, 60)).toBeNull()
    expect(addMinutes({ hour: 0, minute: 0 }, -1)).toBeNull()
  })

  it('clamps and rounds within the current day', () => {
    expect(
      clampAppTime(
        { hour: 8, minute: 0 },
        { hour: 9, minute: 30 },
        { hour: 18, minute: 0 },
      ),
    ).toEqual({ hour: 9, minute: 30 })
    expect(roundTimeToStep({ hour: 9, minute: 28 }, 5)).toEqual({
      hour: 9,
      minute: 30,
    })
    expect(roundTimeToStep({ hour: 23, minute: 59 }, 30)).toEqual({
      hour: 23,
      minute: 30,
    })
  })

  it('normalizes supported and invalid minute steps', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(normalizeMinuteStep(5)).toBe(5)
    expect(normalizeMinuteStep(15)).toBe(15)
    expect(normalizeMinuteStep(7)).toBe(1)
    expect(normalizeMinuteStep(0)).toBe(1)
    expect(warning).toHaveBeenCalled()
  })

  it('validates same-day ranges and returns duration minutes', () => {
    expect(
      getTimeRangeDuration({
        start: { hour: 9, minute: 0 },
        end: { hour: 10, minute: 30 },
      }),
    ).toBe(90)
    expect(
      isValidTimeRange({
        start: { hour: 9, minute: 0 },
        end: { hour: 9, minute: 0 },
      }),
    ).toBe(false)
    expect(
      isValidTimeRange({
        start: { hour: 18, minute: 0 },
        end: { hour: 9, minute: 0 },
      }),
    ).toBe(false)
  })

  it('formats 12 and 24 hour displays and reads local current time', () => {
    expect(formatAppTime({ hour: 18, minute: 30 }, 'en-US', 24)).toBe(
      '18:30',
    )
    expect(formatAppTime({ hour: 18, minute: 30 }, 'en-US', 12)).toBe(
      '6:30 PM',
    )
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 6, 16, 23, 45))
    expect(getCurrentAppTime()).toEqual({ hour: 23, minute: 45 })
  })
})
