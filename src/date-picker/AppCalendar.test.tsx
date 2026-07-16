// @vitest-environment jsdom

import { act, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppCalendar } from './AppCalendar'
import { getCalendarMonthDays } from './calendarMath'
import type { AppDateValue, AppWeekDay } from './types'
import './AppDatePicker.css'

function CalendarHarness({
  initialFocus = { year: 2026, month: 7, day: 16 },
  firstDayOfWeek = 0,
  onSelect = () => undefined,
  unavailable,
  visibleMonths = 1,
}: {
  initialFocus?: AppDateValue
  firstDayOfWeek?: AppWeekDay
  onSelect?: (value: AppDateValue) => void
  unavailable?: (value: AppDateValue) => boolean
  visibleMonths?: 1 | 2
}) {
  const [focusedDate, setFocusedDate] = useState(initialFocus)
  const [displayedMonth, setDisplayedMonth] = useState({
    ...initialFocus,
    day: 1,
  })

  return (
    <AppCalendar
      displayedMonth={displayedMonth}
      firstDayOfWeek={firstDayOfWeek}
      focusedDate={focusedDate}
      isDateUnavailable={unavailable}
      locale="en-US"
      maxValue={{ year: 2027, month: 12, day: 31 }}
      minValue={{ year: 2025, month: 1, day: 1 }}
      nextMonthLabel="Next month"
      onDateSelect={onSelect}
      onDisplayedMonthChange={setDisplayedMonth}
      onFocusedDateChange={setFocusedDate}
      previousMonthLabel="Previous month"
      showOutsideDays
      visibleMonths={visibleMonths}
    />
  )
}

describe('AppCalendar', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
      .IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
  })

  const render = (node: React.ReactNode) =>
    act(() => root.render(node))
  const focused = () =>
    container.querySelector<HTMLButtonElement>('[tabindex="0"]')!
  const keyDown = (key: string, shiftKey = false) =>
    act(() =>
      focused().dispatchEvent(
        new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          key,
          shiftKey,
        }),
      ),
    )

  it('generates a fixed 42-day grid using the configured week start', () => {
    const sunday = getCalendarMonthDays(
      { year: 2026, month: 7, day: 1 },
      0,
    )
    const monday = getCalendarMonthDays(
      { year: 2026, month: 7, day: 1 },
      1,
    )
    expect(sunday).toHaveLength(42)
    expect(sunday[0]).toEqual({ year: 2026, month: 6, day: 28 })
    expect(monday[0]).toEqual({ year: 2026, month: 6, day: 29 })
  })

  it('renders one roving tab stop and moves by day, week, and month', () => {
    render(<CalendarHarness />)
    expect(focused().dataset.date).toBe('2026-07-16')
    expect(container.querySelectorAll('[tabindex="0"]')).toHaveLength(1)

    keyDown('ArrowRight')
    expect(focused().dataset.date).toBe('2026-07-17')
    keyDown('ArrowDown')
    expect(focused().dataset.date).toBe('2026-07-24')
    keyDown('PageDown')
    expect(focused().dataset.date).toBe('2026-08-24')
    keyDown('PageUp', true)
    expect(focused().dataset.date).toBe('2025-08-24')
  })

  it('moves Home and End to the configured week boundaries', () => {
    render(<CalendarHarness firstDayOfWeek={1} />)
    keyDown('Home')
    expect(focused().dataset.date).toBe('2026-07-13')
    keyDown('End')
    expect(focused().dataset.date).toBe('2026-07-19')
  })

  it('skips unavailable dates and prevents their selection', () => {
    const onSelect = vi.fn()
    render(
      <CalendarHarness
        onSelect={onSelect}
        unavailable={(value) => value.day === 17}
      />,
    )
    const unavailable = container.querySelector<HTMLButtonElement>(
      '[data-date="2026-07-17"]',
    )!
    expect(unavailable.disabled).toBe(true)
    act(() => unavailable.click())
    expect(onSelect).not.toHaveBeenCalled()

    keyDown('ArrowRight')
    expect(focused().dataset.date).toBe('2026-07-18')
    keyDown('Enter')
    expect(onSelect).toHaveBeenCalledWith({
      year: 2026,
      month: 7,
      day: 18,
    })
  })

  it('marks selected, range, and preview states internally', () => {
    render(
      <AppCalendar
        displayedMonth={{ year: 2026, month: 7, day: 1 }}
        firstDayOfWeek={0}
        focusedDate={{ year: 2026, month: 7, day: 1 }}
        locale="en-US"
        nextMonthLabel="Next"
        onDateSelect={() => undefined}
        onDisplayedMonthChange={() => undefined}
        onFocusedDateChange={() => undefined}
        previewRange={{
          start: { year: 2026, month: 7, day: 10 },
          end: { year: 2026, month: 7, day: 12 },
        }}
        previousMonthLabel="Previous"
        selectedRange={{
          start: { year: 2026, month: 7, day: 1 },
          end: { year: 2026, month: 7, day: 3 },
        }}
        showOutsideDays={false}
        visibleMonths={1}
      />,
    )

    expect(
      container
        .querySelector('[data-date="2026-07-01"]')
        ?.classList.contains('app-calendar__day--range-start'),
    ).toBe(true)
    expect(
      container
        .querySelector('[data-date="2026-07-02"]')
        ?.classList.contains('app-calendar__day--range-middle'),
    ).toBe(true)
    expect(
      container
        .querySelector('[data-date="2026-07-03"]')
        ?.classList.contains('app-calendar__day--range-end'),
    ).toBe(true)
    expect(
      container
        .querySelector('[data-date="2026-07-11"]')
        ?.classList.contains('app-calendar__day--preview-middle'),
    ).toBe(true)
    expect(
      container.querySelector<HTMLButtonElement>(
        '[data-date="2026-06-28"]',
      )?.disabled,
    ).toBe(true)
  })

  it('renders two months with shared navigation', () => {
    render(<CalendarHarness visibleMonths={2} />)
    expect(container.querySelectorAll('.app-calendar__grid')).toHaveLength(2)
    expect(container.querySelectorAll('.app-calendar__nav')).toHaveLength(2)
    expect(container.textContent).toContain('July 2026')
    expect(container.textContent).toContain('August 2026')
  })
})
