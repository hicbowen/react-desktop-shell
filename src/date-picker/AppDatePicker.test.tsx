// @vitest-environment jsdom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppDialog } from '../dialog/AppDialog'
import { AppField } from '../field/AppField'
import { AppShell } from '../shell/AppShell'
import { AppDatePicker } from './AppDatePicker'

describe('AppDatePicker', () => {
  let container: HTMLDivElement
  let outside: HTMLButtonElement
  let root: Root
  let frames: FrameRequestCallback[]
  let triggerLeft: number
  let triggerTop: number

  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
      .IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement('div')
    outside = document.createElement('button')
    outside.textContent = 'Outside'
    document.body.append(container, outside)
    root = createRoot(container)
    frames = []
    triggerLeft = 100
    triggerTop = 100
    vi.stubGlobal('innerWidth', 1440)
    vi.stubGlobal('innerHeight', 900)
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 6, 16, 12))
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn((callback: FrameRequestCallback) => {
        frames.push(callback)
        return frames.length
      }),
    )
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      function (this: HTMLElement) {
        if (this.classList.contains('app-date-picker')) {
          return {
            bottom: triggerTop + 32,
            height: 32,
            left: triggerLeft,
            right: triggerLeft + 220,
            top: triggerTop,
            width: 220,
          } as DOMRect
        }
        return {
          bottom: 340,
          height: 300,
          left: 0,
          right: 300,
          top: 40,
          width: 300,
        } as DOMRect
      },
    )
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
    outside.remove()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  const render = (node: React.ReactNode) =>
    act(() => root.render(node))
  const display = () =>
    container.querySelector<HTMLButtonElement>('.app-date-picker__display')!
  const calendarButton = () =>
    container.querySelectorAll<HTMLButtonElement>(
      '.app-date-picker__icon-button',
    ).item(
      container.querySelectorAll('.app-date-picker__icon-button').length - 1,
    )
  const popup = () =>
    document.body.querySelector<HTMLElement>('.app-date-picker__popup')
  const flushFrames = () =>
    act(() => {
      while (frames.length) frames.shift()?.(0)
    })
  const clickDate = (date: string) =>
    act(() =>
      popup()
        ?.querySelector<HTMLButtonElement>(`[data-date="${date}"]`)
        ?.click(),
    )

  it('supports uncontrolled selection, clear, and hidden form values', () => {
    const change = vi.fn()
    render(
      <AppDatePicker
        allowClear
        defaultOpen
        name="courseDate"
        onValueChange={change}
      />,
    )
    flushFrames()
    clickDate('2026-07-20')

    expect(change).toHaveBeenCalledWith({
      year: 2026,
      month: 7,
      day: 20,
    })
    expect(display().textContent).toContain('07/20/2026')
    expect(
      container.querySelector<HTMLInputElement>('[type="hidden"]')?.value,
    ).toBe('2026-07-20')
    expect(popup()).toBeNull()

    const clear = container.querySelector<HTMLButtonElement>(
      '[aria-label="Clear date"]',
    )!
    act(() => clear.click())
    expect(change).toHaveBeenLastCalledWith(null)
    expect(display().textContent).toBe('Select a date')
  })

  it('keeps controlled values when the parent rejects a selection', () => {
    const change = vi.fn()
    render(
      <AppDatePicker
        defaultOpen
        onValueChange={change}
        value={{ year: 2026, month: 7, day: 16 }}
      />,
    )
    flushFrames()
    clickDate('2026-07-20')

    expect(change).toHaveBeenCalledOnce()
    expect(display().textContent).toContain('07/16/2026')
    expect(popup()).toBeNull()
  })

  it('supports controlled open state and Alt+ArrowDown', () => {
    const openChange = vi.fn()
    render(<AppDatePicker onOpenChange={openChange} open={false} />)
    act(() =>
      display().dispatchEvent(
        new KeyboardEvent('keydown', {
          altKey: true,
          bubbles: true,
          cancelable: true,
          key: 'ArrowDown',
        }),
      ),
    )
    expect(openChange).toHaveBeenCalledWith(true)
    expect(popup()).toBeNull()
  })

  it('honors disabled, readOnly, min, max, and unavailable dates', () => {
    const change = vi.fn()
    render(<AppDatePicker disabled onValueChange={change} />)
    act(() => display().click())
    expect(popup()).toBeNull()

    render(
      <AppDatePicker
        defaultOpen
        isDateUnavailable={(date) => date.day === 18}
        key="readonly"
        maxValue={{ year: 2026, month: 7, day: 20 }}
        minValue={{ year: 2026, month: 7, day: 10 }}
        onValueChange={change}
        readOnly
      />,
    )
    flushFrames()
    expect(
      popup()?.querySelector<HTMLButtonElement>('[data-date="2026-07-09"]')
        ?.disabled,
    ).toBe(true)
    expect(
      popup()?.querySelector<HTMLButtonElement>('[data-date="2026-07-18"]')
        ?.disabled,
    ).toBe(true)
    clickDate('2026-07-19')
    expect(change).not.toHaveBeenCalled()
    expect(popup()).not.toBeNull()
  })

  it('inherits AppField state and submits locale-independent ISO values', () => {
    render(
      <AppField error="Required date" label="Course date" required>
        <AppDatePicker
          name="date"
          value={{ year: 2026, month: 7, day: 16 }}
        />
      </AppField>,
    )
    expect(display().id).not.toBe('')
    expect(display().getAttribute('aria-invalid')).toBe('true')
    expect(display().getAttribute('aria-required')).toBe('true')
    expect(display().getAttribute('aria-describedby')).not.toBeNull()
    expect(container.querySelector<HTMLInputElement>('[name="date"]')?.value)
      .toBe('2026-07-16')
  })

  it('closes on Escape and outside pointer down', () => {
    render(<AppDatePicker defaultOpen />)
    flushFrames()
    act(() =>
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          key: 'Escape',
        }),
      ),
    )
    expect(popup()).toBeNull()
    expect(document.activeElement).toBe(calendarButton())

    act(() => display().click())
    flushFrames()
    act(() =>
      outside.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          cancelable: true,
        }),
      ),
    )
    expect(popup()).toBeNull()
  })

  it('uses fixed content-sized geometry in the AppShell host', () => {
    render(
      <AppShell>
        <AppDatePicker defaultOpen />
      </AppShell>,
    )
    flushFrames()
    const shellHost = container.querySelector('.app-shell__overlay-host')
    expect(shellHost?.contains(popup())).toBe(true)
    expect(popup()?.style.position).toBe('fixed')
    expect(popup()?.style.width).toBe('max-content')
    expect(popup()?.style.left).toBe('100px')
    expect(popup()?.style.top).toBe('137px')
  })

  it('portals into a dialog-local overlay host with viewport geometry', () => {
    render(
      <AppShell>
        <AppDialog
          open
          title="Schedule"
          children={<AppDatePicker defaultOpen />}
        />
      </AppShell>,
    )
    flushFrames()
    const localHost = container.querySelector('.app-dialog__overlay-host')
    expect(localHost?.contains(popup())).toBe(true)
    expect(container.querySelector('.app-shell__overlay-host')?.contains(popup()))
      .toBe(false)
    expect(popup()?.style.position).toBe('fixed')
    expect(popup()?.style.width).toBe('max-content')
    expect(popup()?.style.left).toBe('100px')
    expect(popup()?.style.top).toBe('137px')
  })

  it('repositions on scroll and resize and is safe when unmounted open', () => {
    render(<AppDatePicker defaultOpen />)
    flushFrames()
    expect(popup()?.style.left).toBe('100px')

    triggerLeft = 260
    act(() => window.dispatchEvent(new Event('scroll')))
    flushFrames()
    expect(popup()?.style.left).toBe('260px')

    triggerTop = 220
    act(() => window.dispatchEvent(new Event('resize')))
    flushFrames()
    expect(popup()?.style.top).toBe('257px')

    expect(() => act(() => root.unmount())).not.toThrow()
  })
})
