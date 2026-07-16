// @vitest-environment jsdom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppDialog } from '../dialog/AppDialog'
import { AppField } from '../field/AppField'
import { AppPopover } from '../popover/AppPopover'
import { AppShell } from '../shell/AppShell'
import { AppDateRangePicker } from './AppDateRangePicker'

describe('AppDateRangePicker', () => {
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
    vi.setSystemTime(new Date(2026, 6, 16, 12))
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
      right: 500,
      top: 100,
      width: 400,
    } as DOMRect)
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
      '.app-date-range-picker__popup',
    )
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
  const action = (label: string) =>
    Array.from(
      popup()?.querySelectorAll<HTMLButtonElement>(
        '.app-date-range-picker__action',
      ) ?? [],
    ).find((button) => button.textContent === label)!

  it('keeps selection pending until Apply and sorts endpoints', () => {
    const change = vi.fn()
    render(
      <AppDateRangePicker
        defaultOpen
        onValueChange={change}
        visibleMonths={1}
      />,
    )
    flushFrames()
    clickDate('2026-07-20')
    clickDate('2026-07-10')
    expect(change).not.toHaveBeenCalled()
    expect(action('Apply').disabled).toBe(false)
    expect(popup()?.textContent).toContain('11 selected days')

    act(() => action('Apply').click())
    expect(change).toHaveBeenCalledWith({
      start: { year: 2026, month: 7, day: 10 },
      end: { year: 2026, month: 7, day: 20 },
    })
    expect(popup()).toBeNull()
    expect(container.textContent).toContain('07/10/2026')
    expect(container.textContent).toContain('07/20/2026')
  })

  it('does not submit pending values on Cancel, Escape, or outside click', () => {
    const change = vi.fn()
    render(
      <AppDateRangePicker
        defaultOpen
        onValueChange={change}
        visibleMonths={1}
      />,
    )
    flushFrames()
    clickDate('2026-07-10')
    clickDate('2026-07-12')
    act(() => action('Cancel').click())
    expect(change).not.toHaveBeenCalled()

    act(() =>
      container
        .querySelector<HTMLButtonElement>(
          '.app-date-range-picker__segment',
        )
        ?.click(),
    )
    flushFrames()
    clickDate('2026-07-10')
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
          '.app-date-range-picker__segment',
        )
        ?.click(),
    )
    flushFrames()
    clickDate('2026-07-10')
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

  it('supports same-day ranges and duration limits', () => {
    render(
      <AppDateRangePicker
        defaultOpen
        minDuration={2}
        visibleMonths={1}
      />,
    )
    flushFrames()
    clickDate('2026-07-16')
    clickDate('2026-07-16')
    expect(popup()?.textContent).toContain('1 selected days')
    expect(action('Apply').disabled).toBe(true)

    clickDate('2026-07-18')
    expect(action('Apply').disabled).toBe(false)

    render(
      <AppDateRangePicker
        defaultOpen
        key="maximum"
        maxDuration={2}
        visibleMonths={1}
      />,
    )
    flushFrames()
    clickDate('2026-07-10')
    clickDate('2026-07-12')
    expect(action('Apply').disabled).toBe(true)
  })

  it('renders hover and keyboard preview while only start is pending', () => {
    render(<AppDateRangePicker defaultOpen visibleMonths={1} />)
    flushFrames()
    clickDate('2026-07-16')
    const hover = popup()!.querySelector<HTMLButtonElement>(
      '[data-date="2026-07-19"]',
    )!
    act(() =>
      hover.dispatchEvent(new MouseEvent('mouseover', { bubbles: true })),
    )
    expect(
      popup()
        ?.querySelector('[data-date="2026-07-18"]')
        ?.classList.contains('app-calendar__day--preview-middle'),
    ).toBe(true)

    const focused = popup()!.querySelector<HTMLButtonElement>('[tabindex="0"]')!
    act(() =>
      focused.dispatchEvent(
        new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          key: 'ArrowRight',
        }),
      ),
    )
    expect(
      popup()?.querySelector('.app-calendar__day--preview-end'),
    ).not.toBeNull()
  })

  it('supports controlled values, clear, and hidden inputs', () => {
    const change = vi.fn()
    render(
      <AppDateRangePicker
        allowClear
        endName="end"
        onValueChange={change}
        startName="start"
        value={{
          start: { year: 2026, month: 7, day: 1 },
          end: { year: 2026, month: 7, day: 2 },
        }}
      />,
    )
    expect(container.querySelector<HTMLInputElement>('[name="start"]')?.value)
      .toBe('2026-07-01')
    expect(container.querySelector<HTMLInputElement>('[name="end"]')?.value)
      .toBe('2026-07-02')
    act(() =>
      container
        .querySelector<HTMLButtonElement>(
          '[aria-label="Clear date range"]',
        )
        ?.click(),
    )
    expect(change).toHaveBeenCalledWith(null)
    expect(container.textContent).toContain('07/01/2026')
  })

  it('closes after applying a cross-month controlled range without changing display', () => {
    const change = vi.fn()
    render(
      <AppDateRangePicker
        defaultOpen
        onValueChange={change}
        value={{
          start: { year: 2026, month: 7, day: 1 },
          end: { year: 2026, month: 7, day: 2 },
        }}
        visibleMonths={2}
      />,
    )
    flushFrames()
    clickDate('2026-07-31')
    clickDate('2026-08-02')
    act(() => action('Apply').click())

    expect(change).toHaveBeenCalledWith({
      start: { year: 2026, month: 7, day: 31 },
      end: { year: 2026, month: 8, day: 2 },
    })
    expect(popup()).toBeNull()
    expect(container.textContent).toContain('07/01/2026')
    expect(container.textContent).toContain('07/02/2026')
  })

  it('integrates with AppField and submits empty or complete ISO fields', () => {
    render(
      <AppField error="Choose a range" label="Report range" required>
        <AppDateRangePicker
          endName="end"
          startName="start"
          value={null}
        />
      </AppField>,
    )
    const firstSegment = container.querySelector<HTMLButtonElement>(
      '.app-date-range-picker__segment',
    )!
    expect(firstSegment.getAttribute('aria-invalid')).toBe('true')
    expect(firstSegment.getAttribute('aria-required')).toBe('true')
    expect(firstSegment.getAttribute('aria-describedby')).not.toBeNull()
    expect(container.querySelector<HTMLInputElement>('[name="start"]')?.value)
      .toBe('')
    expect(container.querySelector<HTMLInputElement>('[name="end"]')?.value)
      .toBe('')
  })

  it('disables invalid endpoints and remains view-only when readOnly', () => {
    const change = vi.fn()
    render(
      <AppDateRangePicker
        defaultOpen
        isDateUnavailable={(date) => date.day === 18}
        maxValue={{ year: 2026, month: 7, day: 20 }}
        minValue={{ year: 2026, month: 7, day: 10 }}
        onValueChange={change}
        readOnly
        visibleMonths={1}
      />,
    )
    flushFrames()
    expect(
      popup()?.querySelector<HTMLButtonElement>('[data-date="2026-07-18"]')
        ?.disabled,
    ).toBe(true)
    clickDate('2026-07-16')
    expect(change).not.toHaveBeenCalled()
    expect(action('Apply').disabled).toBe(true)
  })

  it('renders two months and portals into a dialog-local host', () => {
    render(
      <AppShell>
        <AppDialog
          open
          title="Report dates"
          children={
            <AppDateRangePicker defaultOpen visibleMonths={2} />
          }
        />
      </AppShell>,
    )
    flushFrames()
    expect(popup()?.querySelectorAll('.app-calendar__grid')).toHaveLength(2)
    expect(
      container.querySelector('.app-dialog__overlay-host')?.contains(popup()),
    ).toBe(true)
  })

  it('coordinates dismissal when nested inside another overlay', () => {
    render(
      <AppPopover
        defaultOpen
        trigger={<button type="button">Parent</button>}
      >
        <AppDateRangePicker defaultOpen visibleMonths={1} />
      </AppPopover>,
    )
    flushFrames()
    const date = popup()!.querySelector<HTMLButtonElement>(
      '[data-date="2026-07-16"]',
    )!
    act(() =>
      date.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          cancelable: true,
        }),
      ),
    )
    expect(document.body.querySelector('.app-popover')).not.toBeNull()
    expect(popup()).not.toBeNull()

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
