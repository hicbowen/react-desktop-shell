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

  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
      .IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement('div')
    outside = document.createElement('button')
    document.body.append(container, outside)
    root = createRoot(container)
    frames = []
    triggerLeft = 100
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
          bottom: picker ? 132 : 340,
          height: picker ? 32 : 300,
          left: picker ? triggerLeft : 0,
          right: picker ? triggerLeft + 220 : 220,
          top: picker ? 100 : 40,
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
  })

  it('repositions on scroll and is safe when unmounted open', () => {
    render(<AppTimePicker defaultOpen />)
    flushFrames()
    expect(popup()?.style.left).toBe('100px')
    triggerLeft = 250
    act(() => window.dispatchEvent(new Event('scroll')))
    flushFrames()
    expect(popup()?.style.left).toBe('250px')
    expect(() => act(() => root.unmount())).not.toThrow()
  })
})
