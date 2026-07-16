// @vitest-environment jsdom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppDialog } from '../dialog/AppDialog'
import { AppField } from '../field/AppField'
import { AppShell } from '../shell/AppShell'
import { AppTimePicker } from './AppTimePicker'

describe('AppTimePicker', () => {
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
    document.body.append(container, outside)
    root = createRoot(container)
    frames = []
    triggerLeft = 540
    triggerTop = 260
    vi.stubGlobal('innerWidth', 1440)
    vi.stubGlobal('innerHeight', 900)
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 6, 16, 9, 28))
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
        const picker = this.classList.contains('app-time-picker')
        return {
          bottom: picker ? triggerTop + 32 : 340,
          height: picker ? 32 : 300,
          left: picker ? triggerLeft : 0,
          right: picker ? triggerLeft + 220 : 220,
          top: picker ? triggerTop : 40,
          width: 220,
        } as DOMRect
      },
    )
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: vi.fn(),
    })
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
    container.querySelector<HTMLButtonElement>('.app-time-picker__display')!
  const popup = () =>
    document.body.querySelector<HTMLElement>('.app-time-picker__popup')
  const flushFrames = () =>
    act(() => {
      while (frames.length) frames.shift()?.(0)
    })
  const list = (index: number) =>
    popup()!.querySelectorAll<HTMLElement>('[role="listbox"]')[index]!
  const option = (column: number, text: string) =>
    Array.from(
      list(column).querySelectorAll<HTMLButtonElement>('[role="option"]'),
    ).find((item) => item.textContent === text)!
  const action = (label: string) =>
    Array.from(
      popup()!.querySelectorAll<HTMLButtonElement>(
        '.app-time-picker__action',
      ),
    ).find((button) => button.textContent === label)!
  const timeButton = () =>
    container.querySelector<HTMLButtonElement>(
      '[aria-label="Open time picker"]',
    )!

  it('initializes pending from current time and submits only on Apply', () => {
    const change = vi.fn()
    render(
      <AppTimePicker
        defaultOpen
        minuteStep={5}
        onValueChange={change}
      />,
    )
    flushFrames()
    expect(list(0).querySelector('[aria-selected="true"]')?.textContent)
      .toBe('09')
    expect(list(1).querySelector('[aria-selected="true"]')?.textContent)
      .toBe('30')

    act(() => option(0, '10').click())
    act(() => option(1, '35').click())
    expect(change).not.toHaveBeenCalled()
    act(() => action('Apply').click())
    expect(change).toHaveBeenCalledWith({ hour: 10, minute: 35 })
    expect(display().textContent).toBe('10:35')
    expect(popup()).toBeNull()
  })

  it('cancels pending on Cancel, Escape, and outside pointer', () => {
    const change = vi.fn()
    render(
      <AppTimePicker
        defaultOpen
        defaultValue={{ hour: 9, minute: 0 }}
        onValueChange={change}
      />,
    )
    flushFrames()
    act(() => option(0, '10').click())
    act(() => action('Cancel').click())
    expect(change).not.toHaveBeenCalled()

    act(() => display().click())
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
    expect(change).not.toHaveBeenCalled()

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
    expect(change).not.toHaveBeenCalled()
  })

  it('preserves pending time when controlled close is rejected', () => {
    const change = vi.fn()
    const openChange = vi.fn()
    render(
      <AppTimePicker
        minuteStep={5}
        onOpenChange={openChange}
        onValueChange={change}
        open
        value={{ hour: 9, minute: 0 }}
      />,
    )
    flushFrames()
    act(() => option(0, '10').click())
    act(() => option(1, '35').click())

    act(() =>
      outside.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          cancelable: true,
        }),
      ),
    )
    expect(openChange).toHaveBeenCalledWith(false)
    expect(popup()).not.toBeNull()
    expect(list(0).querySelector('[aria-selected="true"]')?.textContent)
      .toBe('10')
    expect(list(1).querySelector('[aria-selected="true"]')?.textContent)
      .toBe('35')

    act(() => action('Apply').click())
    expect(change).toHaveBeenCalledWith({ hour: 10, minute: 35 })
    expect(popup()).not.toBeNull()

    render(
      <AppTimePicker
        minuteStep={5}
        onOpenChange={openChange}
        onValueChange={change}
        open={false}
        value={{ hour: 9, minute: 0 }}
      />,
    )
    expect(popup()).toBeNull()
  })

  it('supports controlled values, clear, 12-hour display, and hidden ISO', () => {
    const change = vi.fn()
    render(
      <AppTimePicker
        allowClear
        hourCycle={12}
        name="reminder"
        onValueChange={change}
        value={{ hour: 18, minute: 30 }}
      />,
    )
    expect(display().textContent).toBe('6:30 PM')
    expect(
      container.querySelector<HTMLInputElement>('[name="reminder"]')?.value,
    ).toBe('18:30')
    act(() =>
      container
        .querySelector<HTMLButtonElement>('[aria-label="Clear time"]')
        ?.click(),
    )
    expect(change).toHaveBeenCalledWith(null)
    expect(display().textContent).toBe('6:30 PM')
  })

  it('honors min/max, readOnly, disabled, and controlled open state', () => {
    const openChange = vi.fn()
    render(
      <AppTimePicker
        onOpenChange={openChange}
        open={false}
      />,
    )
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

    render(<AppTimePicker disabled key="disabled" />)
    act(() => display().click())
    expect(popup()).toBeNull()

    render(
      <AppTimePicker
        defaultOpen
        key="readonly"
        maxValue={{ hour: 10, minute: 15 }}
        minValue={{ hour: 9, minute: 30 }}
        readOnly
      />,
    )
    flushFrames()
    expect(option(0, '08').disabled).toBe(true)
    expect(action('Apply').disabled).toBe(true)
  })

  it('disables Apply when bounds contain no step-aligned value', () => {
    const change = vi.fn()
    render(
      <AppTimePicker
        defaultOpen
        maxValue={{ hour: 9, minute: 18 }}
        minValue={{ hour: 9, minute: 17 }}
        minuteStep={15}
        onValueChange={change}
      />,
    )
    flushFrames()

    expect(popup()?.textContent).toContain('No available times')
    expect(action('Apply').disabled).toBe(true)
    expect(popup()?.querySelectorAll('[aria-selected="true"]')).toHaveLength(
      0,
    )
    act(() => action('Apply').click())
    expect(change).not.toHaveBeenCalled()
  })

  it('inherits AppField state and portals into a dialog-local host', () => {
    render(
      <AppShell>
        <AppDialog
          children={
            <AppField error="Required time" label="Start time" required>
              <AppTimePicker defaultOpen name="start" />
            </AppField>
          }
          open
          title="Schedule"
        />
      </AppShell>,
    )
    flushFrames()
    expect(display().getAttribute('aria-invalid')).toBe('true')
    expect(display().getAttribute('aria-required')).toBe('true')
    expect(display().getAttribute('aria-describedby')).not.toBeNull()
    expect(
      container.querySelector('.app-dialog__overlay-host')?.contains(popup()),
    ).toBe(true)
    expect(popup()?.style.position).toBe('fixed')
    expect(popup()?.style.width).toBe('max-content')
    expect(popup()?.style.left).toBe('540px')
    expect(popup()?.style.top).toBe('297px')
    expect(popup()?.getAttribute('role')).toBe('dialog')
    expect(popup()?.getAttribute('aria-label')).toBe('Open time picker')
  })

  it('focuses the selected hour and restores the actual opener', () => {
    render(
      <AppTimePicker
        defaultValue={{ hour: 9, minute: 30 }}
      />,
    )
    act(() => display().click())
    flushFrames()
    expect(document.activeElement).toBe(option(0, '09'))
    act(() => action('Cancel').click())
    expect(document.activeElement).toBe(display())

    act(() => timeButton().click())
    flushFrames()
    expect(document.activeElement).toBe(option(0, '09'))
    act(() =>
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          key: 'Escape',
        }),
      ),
    )
    expect(document.activeElement).toBe(timeButton())
  })

  it('uses its own anchor and repositions on scroll and resize', () => {
    render(<AppTimePicker defaultOpen />)
    flushFrames()
    expect(popup()?.style.position).toBe('fixed')
    expect(popup()?.style.width).toBe('max-content')
    expect(popup()?.style.left).toBe('540px')
    expect(popup()?.style.top).toBe('297px')

    triggerLeft = 620
    act(() => window.dispatchEvent(new Event('scroll')))
    flushFrames()
    expect(popup()?.style.left).toBe('620px')

    triggerTop = 320
    act(() => window.dispatchEvent(new Event('resize')))
    flushFrames()
    expect(popup()?.style.top).toBe('357px')

    expect(() => act(() => root.unmount())).not.toThrow()
  })
})
