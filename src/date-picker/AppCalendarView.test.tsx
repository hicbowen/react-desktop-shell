// @vitest-environment jsdom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppCalendar } from './AppCalendarView'

describe('public AppCalendar', () => {
  let container: HTMLDivElement
  let root: Root
  beforeEach(() => { container = document.createElement('div'); document.body.append(container); root = createRoot(container) })
  afterEach(() => { act(() => root.unmount()); container.remove() })

  it('owns selection and display state by default', () => {
    const onValueChange = vi.fn()
    act(() => root.render(<AppCalendar defaultDisplayedMonth={{ year: 2026, month: 7, day: 1 }} defaultValue={{ year: 2026, month: 7, day: 10 }} onValueChange={onValueChange} />))
    const day = container.querySelector<HTMLButtonElement>('[data-date="2026-07-14"]')!
    act(() => day.click())
    expect(onValueChange).toHaveBeenCalledWith({ year: 2026, month: 7, day: 14 })
    expect(day.getAttribute('aria-selected')).toBe('true')
  })

  it('renders as an embedded group instead of a dialog', () => {
    act(() => root.render(<AppCalendar defaultDisplayedMonth={{ year: 2026, month: 7, day: 1 }} />))
    expect(container.querySelector('[role="group"]')).not.toBeNull()
    expect(container.querySelector('[role="dialog"]')).toBeNull()
  })
})
