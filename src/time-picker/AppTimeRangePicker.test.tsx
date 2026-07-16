// @vitest-environment jsdom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppDialog } from '../dialog/AppDialog'
import { AppField } from '../field/AppField'
import { AppPopover } from '../popover/AppPopover'
import { AppShell } from '../shell/AppShell'
import { AppTimeRangePicker } from './AppTimeRangePicker'

describe('AppTimeRangePicker', () => {
  let container: HTMLDivElement
  let outside: HTMLButtonElement
  let root: Root
  let frames: FrameRequestCallback[]

  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
      .IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement('div')
    outside = document.createElement('button')
    document.body.append(container, outside)
    root = createRoot(container)
    frames = []
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 6, 16, 9, 0))
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn((callback: FrameRequestCallback) => {
        frames.push(callback)
        return frames.length
      }),
    )
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      bottom: 132,
      height: 32,
      left: 100,
      right: 440,
      top: 100,
      width: 340,
    } as DOMRect)
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
  const popup = () =>
    document.body.querySelector<HTMLElement>(
      '.app-time-range-picker__popup',
    )
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
  const tab = (label: string) =>
    Array.from(
      popup()!.querySelectorAll<HTMLButtonElement>(
        '.app-time-range-picker__tabs button',
      ),
    ).find((button) => button.textContent === label)!
  const action = (label: string) =>
    Array.from(
      popup()!.querySelectorAll<HTMLButtonElement>(
        '.app-time-picker__action',
      ),
    ).find((button) => button.textContent === label)!

  it('initializes an empty range and submits pending only on Apply', () => {
    const change = vi.fn()
    render(
      <AppTimeRangePicker
        defaultOpen
        minuteStep={5}
        onValueChange={change}
      />,
    )
    flushFrames()
    expect(popup()?.textContent).toContain('60 minutes')
    act(() => option(0, '10').click())
    expect(popup()?.textContent).toContain(
      'End time must be later than start time',
    )
    expect(change).not.toHaveBeenCalled()

    act(() => tab('End time').click())
    act(() => option(0, '11').click())
    act(() => option(1, '30').click())
    expect(action('Apply').disabled).toBe(false)
    act(() => action('Apply').click())
    expect(change).toHaveBeenCalledWith({
      start: { hour: 10, minute: 0 },
      end: { hour: 11, minute: 30 },
    })
    expect(container.textContent).toContain('10:00')
    expect(container.textContent).toContain('11:30')
  })

  it('does not submit pending on Cancel, Escape, or outside pointer', () => {
    const change = vi.fn()
    render(
      <AppTimeRangePicker
        defaultOpen
        defaultValue={{
          start: { hour: 9, minute: 0 },
          end: { hour: 10, minute: 0 },
        }}
        onValueChange={change}
      />,
    )
    flushFrames()
    act(() => option(0, '08').click())
    act(() => action('Cancel').click())
    expect(change).not.toHaveBeenCalled()

    act(() =>
      container
        .querySelector<HTMLButtonElement>(
          '.app-time-range-picker__segment',
        )
        ?.click(),
    )
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

    act(() =>
      container
        .querySelector<HTMLButtonElement>(
          '.app-time-range-picker__segment',
        )
        ?.click(),
    )
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

  it('keeps start and end semantics without sorting invalid ranges', () => {
    render(
      <AppTimeRangePicker
        defaultOpen
        defaultValue={{
          start: { hour: 9, minute: 0 },
          end: { hour: 10, minute: 0 },
        }}
      />,
    )
    flushFrames()
    act(() => option(0, '10').click())
    expect(action('Apply').disabled).toBe(true)
    act(() => tab('End time').click())
    act(() => option(0, '09').click())
    expect(action('Apply').disabled).toBe(true)
    expect(popup()?.textContent).toContain(
      'End time must be later than start time',
    )
  })

  it('enforces duration, min/max, step, and read-only constraints', () => {
    render(
      <AppTimeRangePicker
        defaultOpen
        defaultValue={{
          start: { hour: 9, minute: 30 },
          end: { hour: 10, minute: 0 },
        }}
        maxDuration={60}
        maxValue={{ hour: 11, minute: 0 }}
        minDuration={45}
        minValue={{ hour: 9, minute: 30 }}
        minuteStep={15}
      />,
    )
    flushFrames()
    expect(option(0, '08').disabled).toBe(true)
    expect(list(1).querySelectorAll('[role="option"]')).toHaveLength(4)
    expect(action('Apply').disabled).toBe(true)

    render(
      <AppTimeRangePicker
        defaultOpen
        key="readonly"
        readOnly
        value={{
          start: { hour: 9, minute: 30 },
          end: { hour: 10, minute: 30 },
        }}
      />,
    )
    flushFrames()
    expect(action('Apply').disabled).toBe(true)
  })

  it('supports controlled values, clear, hidden inputs, and AppField', () => {
    const change = vi.fn()
    render(
      <AppField error="Choose a range" label="Meeting time" required>
        <AppTimeRangePicker
          allowClear
          endName="end"
          onValueChange={change}
          startName="start"
          value={{
            start: { hour: 9, minute: 0 },
            end: { hour: 10, minute: 30 },
          }}
        />
      </AppField>,
    )
    const segment = container.querySelector<HTMLButtonElement>(
      '.app-time-range-picker__segment',
    )!
    expect(segment.getAttribute('aria-invalid')).toBe('true')
    expect(segment.getAttribute('aria-required')).toBe('true')
    expect(container.querySelector<HTMLInputElement>('[name="start"]')?.value)
      .toBe('09:00')
    expect(container.querySelector<HTMLInputElement>('[name="end"]')?.value)
      .toBe('10:30')
    act(() =>
      container
        .querySelector<HTMLButtonElement>(
          '[aria-label="Clear time range"]',
        )
        ?.click(),
    )
    expect(change).toHaveBeenCalledWith(null)
    expect(container.textContent).toContain('09:00')
  })

  it('closes after controlled Apply while preserving external 12-hour display', () => {
    const change = vi.fn()
    render(
      <AppTimeRangePicker
        defaultOpen
        hourCycle={12}
        onValueChange={change}
        value={{
          start: { hour: 9, minute: 0 },
          end: { hour: 10, minute: 0 },
        }}
      />,
    )
    flushFrames()
    act(() => tab('End time').click())
    act(() => option(0, '11 AM').click())
    act(() => option(1, '30').click())
    act(() => action('Apply').click())

    expect(change).toHaveBeenCalledWith({
      start: { hour: 9, minute: 0 },
      end: { hour: 11, minute: 30 },
    })
    expect(popup()).toBeNull()
    expect(container.textContent).toContain('9:00 AM')
    expect(container.textContent).toContain('10:00 AM')
  })

  it('portals in a dialog and coordinates a nested parent overlay', () => {
    render(
      <AppShell>
        <AppDialog
          children={<AppTimeRangePicker defaultOpen />}
          open
          title="Meeting"
        />
      </AppShell>,
    )
    flushFrames()
    expect(
      container.querySelector('.app-dialog__overlay-host')?.contains(popup()),
    ).toBe(true)

    render(
      <AppPopover
        defaultOpen
        key="nested"
        trigger={<button type="button">Parent</button>}
      >
        <AppTimeRangePicker defaultOpen />
      </AppPopover>,
    )
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
    expect(document.body.querySelector('.app-popover')).not.toBeNull()
  })
})
