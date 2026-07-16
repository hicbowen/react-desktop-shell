// @vitest-environment jsdom

import { act, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppDialog } from '../dialog/AppDialog'
import { AppField } from '../field/AppField'
import { AppLocaleContext } from '../localization/AppLocaleContext'
import { enUSMessages } from '../localization/locales/en-US'
import { AppPopover } from '../popover/AppPopover'
import { AppShell } from '../shell/AppShell'
import { AppTimeRangePicker } from './AppTimeRangePicker'

function TestLocaleBoundary({ children }: { children: ReactNode }) {
  return (
    <AppLocaleContext.Provider
      value={{
        locale: 'en-US',
        messages: enUSMessages,
        firstDayOfWeek: 0,
        hourCycle: 24,
      }}
    >
      {children}
    </AppLocaleContext.Provider>
  )
}

describe('AppTimeRangePicker', () => {
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
    triggerLeft = 760
    triggerTop = 340
    vi.stubGlobal('innerWidth', 1440)
    vi.stubGlobal('innerHeight', 900)
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
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      function (this: HTMLElement) {
        if (this.classList.contains('app-time-range-picker')) {
          return {
            bottom: triggerTop + 32,
            height: 32,
            left: triggerLeft,
            right: triggerLeft + 340,
            top: triggerTop,
            width: 340,
          } as DOMRect
        }
        return {
          bottom: 380,
          height: 340,
          left: 0,
          right: 420,
          top: 40,
          width: 420,
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
    act(() => root.render(<TestLocaleBoundary>{node}</TestLocaleBoundary>))
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
  const segments = () =>
    container.querySelectorAll<HTMLButtonElement>(
      '.app-time-range-picker__segment',
    )
  const timeButton = () =>
    container.querySelector<HTMLButtonElement>(
      '[aria-label="Open time range picker"]',
    )!

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
    expect(popup()?.textContent).toContain('1 hour')
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

  it('preserves pending range when controlled close is rejected', () => {
    const change = vi.fn()
    const openChange = vi.fn()
    render(
      <AppTimeRangePicker
        onOpenChange={openChange}
        onValueChange={change}
        open
        value={{
          start: { hour: 9, minute: 0 },
          end: { hour: 10, minute: 0 },
        }}
      />,
    )
    flushFrames()
    act(() => option(0, '08').click())
    act(() => tab('End time').click())
    act(() => option(0, '11').click())
    act(() => option(1, '30').click())

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
    expect(action('Apply').disabled).toBe(false)

    act(() => action('Apply').click())
    expect(change).toHaveBeenCalledWith({
      start: { hour: 8, minute: 0 },
      end: { hour: 11, minute: 30 },
    })
    expect(popup()).not.toBeNull()

    render(
      <AppTimeRangePicker
        onOpenChange={openChange}
        onValueChange={change}
        open={false}
        value={{
          start: { hour: 9, minute: 0 },
          end: { hour: 10, minute: 0 },
        }}
      />,
    )
    expect(popup()).toBeNull()
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

  it('normalizes both endpoints to step before applying', () => {
    const change = vi.fn()
    render(
      <AppTimeRangePicker
        defaultOpen
        defaultValue={{
          start: { hour: 9, minute: 28 },
          end: { hour: 10, minute: 52 },
        }}
        maxValue={{ hour: 10, minute: 50 }}
        minValue={{ hour: 9, minute: 17 }}
        minuteStep={15}
        onValueChange={change}
      />,
    )
    flushFrames()

    expect(option(0, '09').getAttribute('aria-selected')).toBe('true')
    expect(option(1, '30').getAttribute('aria-selected')).toBe('true')
    act(() => tab('End time').click())
    expect(option(0, '10').getAttribute('aria-selected')).toBe('true')
    expect(option(1, '45').getAttribute('aria-selected')).toBe('true')
    act(() => action('Apply').click())
    expect(change).toHaveBeenCalledWith({
      start: { hour: 9, minute: 30 },
      end: { hour: 10, minute: 45 },
    })
  })

  it('shows an empty state when no step-aligned time is available', () => {
    const change = vi.fn()
    render(
      <AppTimeRangePicker
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
    act(() => action('Apply').click())
    expect(change).not.toHaveBeenCalled()
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
    expect(container.textContent).toContain('9:00')
  })

  it('closes after controlled Apply while preserving external 12-hour display', () => {
    const change = vi.fn()
    render(
      <AppShell locale="en-US">
        <AppTimeRangePicker
          defaultOpen
          onValueChange={change}
          value={{
            start: { hour: 9, minute: 0 },
            end: { hour: 10, minute: 0 },
          }}
        />
      </AppShell>,
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
    expect(popup()?.style.position).toBe('fixed')
    expect(popup()?.style.width).toBe('max-content')
    expect(popup()?.style.left).toBe('760px')
    expect(popup()?.style.top).toBe('377px')
    expect(popup()?.getAttribute('role')).toBe('dialog')
    expect(popup()?.getAttribute('aria-label')).toBe('Time range picker')

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

  it('uses global language for labels, duration, and time display', () => {
    const value = {
      start: { hour: 9, minute: 0 },
      end: { hour: 10, minute: 30 },
    }
    render(
      <AppShell locale="zh-CN">
        <AppTimeRangePicker defaultOpen value={value} />
      </AppShell>,
    )
    flushFrames()
    expect(container.textContent).toContain('9:00')
    expect(container.textContent).toContain('10:30')
    expect(popup()?.textContent).toContain('1 小时 30 分钟')
    expect(tab('开始时间')).toBeDefined()
    expect(action('应用')).toBeDefined()

    render(
      <AppShell locale="en-US">
        <AppTimeRangePicker defaultOpen value={value} />
      </AppShell>,
    )
    flushFrames()
    expect(container.textContent).toContain('9:00 AM')
    expect(container.textContent).toContain('10:30 AM')
    expect(popup()).not.toBeNull()
    expect(popup()?.textContent).toContain('1 hour 30 minutes')
    expect(tab('Start time')).toBeDefined()
    expect(action('Apply')).toBeDefined()
  })

  it('uses its own anchor and repositions on scroll and resize', () => {
    render(<AppTimeRangePicker defaultOpen />)
    flushFrames()
    expect(popup()?.style.position).toBe('fixed')
    expect(popup()?.style.width).toBe('max-content')
    expect(popup()?.style.left).toBe('760px')
    expect(popup()?.style.top).toBe('377px')

    triggerLeft = 820
    act(() => window.dispatchEvent(new Event('scroll')))
    flushFrames()
    expect(popup()?.style.left).toBe('820px')

    triggerTop = 420
    act(() => window.dispatchEvent(new Event('resize')))
    flushFrames()
    expect(popup()?.style.top).toBe('457px')
  })

  it('focuses the active hour and restores each actual opener', () => {
    render(
      <AppTimeRangePicker
        value={{
          start: { hour: 9, minute: 0 },
          end: { hour: 10, minute: 0 },
        }}
      />,
    )

    act(() => segments()[0]!.click())
    flushFrames()
    expect(document.activeElement).toBe(option(0, '09'))
    act(() => action('Cancel').click())
    expect(document.activeElement).toBe(segments()[0])

    act(() => segments()[1]!.click())
    flushFrames()
    expect(document.activeElement).toBe(option(0, '10'))
    act(() => action('Cancel').click())
    expect(document.activeElement).toBe(segments()[1])

    act(() => timeButton().click())
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
    expect(document.activeElement).toBe(timeButton())
  })
})
