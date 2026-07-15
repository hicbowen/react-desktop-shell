// @vitest-environment jsdom

import { act, createRef, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppShell } from '../shell/AppShell'
import { AppTooltip } from './AppTooltip'

function rect(left: number, top: number, width: number, height: number) {
  return {
    bottom: top + height,
    height,
    left,
    right: left + width,
    top,
    width,
  } as DOMRect
}

describe('AppTooltip', () => {
  let container: HTMLDivElement
  let root: Root
  let frames: Map<number, FrameRequestCallback>
  let nextFrame: number

  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
      .IS_REACT_ACT_ENVIRONMENT = true
    vi.useFakeTimers()
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)
    frames = new Map()
    nextFrame = 1
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn((callback: FrameRequestCallback) => {
        const frame = nextFrame++
        frames.set(frame, callback)
        return frame
      }),
    )
    vi.stubGlobal(
      'cancelAnimationFrame',
      vi.fn((frame: number) => frames.delete(frame)),
    )
    vi.stubGlobal('innerWidth', 800)
    vi.stubGlobal('innerHeight', 600)
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      function (this: HTMLElement) {
        if (this.classList.contains('app-tooltip')) {
          return rect(0, 0, 160, 40)
        }
        return rect(300, 200, 100, 32)
      },
    )
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
    vi.useRealTimers()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  const render = (node: ReactNode) => act(() => root.render(node))
  const trigger = () => container.querySelector<HTMLElement>('button')!
  const tooltip = () =>
    document.body.querySelector<HTMLElement>('[role="tooltip"]')
  const pointerEnter = (element = trigger()) =>
    act(() =>
      element.dispatchEvent(new PointerEvent('pointerover', { bubbles: true })),
    )
  const pointerLeave = (element = trigger()) =>
    act(() =>
      element.dispatchEvent(new PointerEvent('pointerout', { bubbles: true })),
    )
  const advance = (duration: number) =>
    act(() => vi.advanceTimersByTime(duration))
  const flushMeasurement = () => {
    const callbacks = Array.from(frames.values())
    frames.clear()
    act(() => callbacks.forEach((callback) => callback(0)))
  }
  const renderTooltip = (
    props: Partial<React.ComponentProps<typeof AppTooltip>> = {},
  ) =>
    render(
      <AppTooltip content="Tooltip content" {...props}>
        <button className="tooltip-trigger" type="button">
          Trigger
        </button>
      </AppTooltip>,
    )

  it('opens after the hover delay and closes on pointer leave', () => {
    renderTooltip({ delay: 500 })
    pointerEnter()
    advance(499)
    expect(tooltip()).toBeNull()

    advance(1)
    expect(tooltip()).not.toBeNull()
    pointerLeave()
    expect(tooltip()).toBeNull()
  })

  it('cancels a pending hover when the pointer leaves early', () => {
    renderTooltip({ delay: 500 })
    pointerEnter()
    pointerLeave()
    advance(500)

    expect(tooltip()).toBeNull()
  })

  it('opens immediately on focus and closes on blur', () => {
    renderTooltip()
    act(() => trigger().focus())
    expect(tooltip()).not.toBeNull()

    act(() => trigger().blur())
    expect(tooltip()).toBeNull()
  })

  it('keeps hover and focus interaction state independent', () => {
    renderTooltip({ delay: 0 })
    pointerEnter()
    act(() => trigger().focus())
    pointerLeave()
    expect(tooltip()).not.toBeNull()

    act(() => trigger().blur())
    expect(tooltip()).toBeNull()
  })

  it('closes when its trigger is clicked', () => {
    renderTooltip({ delay: 0 })
    pointerEnter()
    expect(tooltip()).not.toBeNull()

    act(() => trigger().click())
    expect(tooltip()).toBeNull()
  })

  it('closes on Escape while preserving the child key handler', () => {
    const onKeyDown = vi.fn()
    render(
      <AppTooltip content="Tooltip content">
        <button onKeyDown={onKeyDown} type="button">
          Trigger
        </button>
      </AppTooltip>,
    )
    act(() => trigger().focus())
    act(() =>
      trigger().dispatchEvent(
        new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }),
      ),
    )

    expect(onKeyDown).toHaveBeenCalledOnce()
    expect(tooltip()).toBeNull()
  })

  it('closes on resize, external scroll, and window blur', () => {
    renderTooltip({ delay: 0 })
    pointerEnter()
    act(() => window.dispatchEvent(new Event('resize')))
    expect(tooltip()).toBeNull()

    pointerLeave()
    pointerEnter()
    act(() => window.dispatchEvent(new Event('scroll')))
    expect(tooltip()).toBeNull()

    pointerLeave()
    pointerEnter()
    act(() => window.dispatchEvent(new Event('blur')))
    expect(tooltip()).toBeNull()
  })

  it('stays hidden until measured and then exposes its final placement', () => {
    renderTooltip({ delay: 0, placement: 'top' })
    pointerEnter()

    expect(tooltip()?.style.visibility).toBe('hidden')
    expect(tooltip()?.style.left).toBe('0px')
    flushMeasurement()

    expect(tooltip()?.style.visibility).toBe('visible')
    expect(tooltip()?.dataset.placement).toBe('top')
    expect(tooltip()?.style.left).toBe('270px')
    expect(tooltip()?.style.top).toBe('154px')
  })

  it('automatically flips when the preferred placement has no room', () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      function (this: HTMLElement) {
        return this.classList.contains('app-tooltip')
          ? rect(0, 0, 160, 40)
          : rect(300, 4, 100, 32)
      },
    )
    renderTooltip({ delay: 0, placement: 'top-start' })
    pointerEnter()
    flushMeasurement()

    expect(tooltip()?.dataset.placement).toBe('bottom-start')
    expect(tooltip()?.style.top).toBe('42px')
  })

  it('adds, combines, and removes aria-describedby', () => {
    render(
      <AppTooltip content="Tooltip content" delay={0}>
        <button aria-describedby="existing" type="button">
          Trigger
        </button>
      </AppTooltip>,
    )
    expect(trigger().getAttribute('aria-describedby')).toBe('existing')

    pointerEnter()
    const tooltipId = tooltip()?.id
    expect(trigger().getAttribute('aria-describedby')).toBe(
      `existing ${tooltipId}`,
    )

    pointerLeave()
    expect(trigger().getAttribute('aria-describedby')).toBe('existing')
  })

  it('preserves child pointer, focus, and blur handlers', () => {
    const onPointerEnter = vi.fn()
    const onPointerLeave = vi.fn()
    const onFocus = vi.fn()
    const onBlur = vi.fn()
    render(
      <AppTooltip content="Tooltip content" delay={0}>
        <button
          onBlur={onBlur}
          onFocus={onFocus}
          onPointerEnter={onPointerEnter}
          onPointerLeave={onPointerLeave}
          type="button"
        >
          Trigger
        </button>
      </AppTooltip>,
    )
    pointerEnter()
    pointerLeave()
    act(() => trigger().focus())
    act(() => trigger().blur())

    expect(onPointerEnter).toHaveBeenCalledOnce()
    expect(onPointerLeave).toHaveBeenCalledOnce()
    expect(onFocus).toHaveBeenCalledOnce()
    expect(onBlur).toHaveBeenCalledOnce()
  })

  it('runs the child event first and respects defaultPrevented', () => {
    const onPointerEnter = vi.fn((event: React.PointerEvent) =>
      event.preventDefault(),
    )
    render(
      <AppTooltip content="Tooltip content" delay={0}>
        <button onPointerEnter={onPointerEnter} type="button">
          Trigger
        </button>
      </AppTooltip>,
    )
    pointerEnter()

    expect(onPointerEnter).toHaveBeenCalledOnce()
    expect(tooltip()).toBeNull()
  })

  it('preserves callback and object child refs', () => {
    const callbackRef = vi.fn()
    render(
      <AppTooltip content="Tooltip content">
        <button ref={callbackRef} type="button">
          Trigger
        </button>
      </AppTooltip>,
    )
    expect(callbackRef).toHaveBeenCalledWith(trigger())

    const objectRef = createRef<HTMLButtonElement>()
    render(
      <AppTooltip content="Tooltip content">
        <button ref={objectRef} type="button">
          Trigger
        </button>
      </AppTooltip>,
    )
    expect(objectRef.current).toBe(trigger())
  })

  it('wraps native disabled controls and can show from wrapper hover', () => {
    const buttonRef = createRef<HTMLButtonElement>()
    render(
      <AppTooltip content="Select an item first" delay={0}>
        <button ref={buttonRef} disabled type="button">
          Delete
        </button>
      </AppTooltip>,
    )
    const wrapper = container.querySelector<HTMLElement>(
      '.app-tooltip__trigger-wrapper',
    )!

    expect(wrapper).not.toBeNull()
    expect(wrapper.hasAttribute('tabindex')).toBe(false)
    expect((trigger() as HTMLButtonElement).disabled).toBe(true)
    expect(buttonRef.current).toBe(trigger())
    pointerEnter(wrapper)
    expect(tooltip()?.textContent).toBe('Select an item first')
  })

  it('does not open for empty content or disabled tooltips', () => {
    renderTooltip({ content: '', delay: 0 })
    pointerEnter()
    expect(tooltip()).toBeNull()

    renderTooltip({ content: null, delay: 0 })
    pointerEnter()
    expect(tooltip()).toBeNull()

    renderTooltip({ disabled: true, delay: 0 })
    pointerEnter()
    expect(tooltip()).toBeNull()
  })

  it('portals into AppShell and inherits its theme boundary', () => {
    render(
      <AppShell theme="dark">
        <AppTooltip content="Tooltip content" delay={0}>
          <button type="button">Trigger</button>
        </AppTooltip>
      </AppShell>,
    )
    pointerEnter()

    const host = container.querySelector('.app-shell__overlay-host')
    expect(host?.contains(tooltip())).toBe(true)
    expect(tooltip()?.closest('.app-shell')?.getAttribute('data-theme')).toBe(
      'dark',
    )
  })

  it('falls back to body with non-interactive base styling', () => {
    renderTooltip({ delay: 0 })
    pointerEnter()

    expect(container.contains(tooltip())).toBe(false)
    expect(getComputedStyle(tooltip()!).pointerEvents).toBe('none')
    expect(getComputedStyle(tooltip()!).backgroundColor).not.toBe(
      'rgba(0, 0, 0, 0)',
    )
  })

  it('constrains width in a narrow viewport', () => {
    vi.stubGlobal('innerWidth', 100)
    renderTooltip({ delay: 0, maxWidth: 320 })
    pointerEnter()
    flushMeasurement()

    expect(tooltip()?.style.maxWidth).toBe('84px')
    expect(
      getComputedStyle(tooltip()!).maxWidth.includes('100vw'),
    ).toBe(false)
  })

  it('cancels pending timers and measurement frames on unmount', () => {
    renderTooltip({ delay: 500 })
    pointerEnter()
    expect(vi.getTimerCount()).toBe(1)
    act(() => root.unmount())
    expect(vi.getTimerCount()).toBe(0)

    root = createRoot(container)
    renderTooltip({ delay: 0 })
    pointerEnter()
    const frame = frames.keys().next().value
    act(() => root.unmount())
    expect(cancelAnimationFrame).toHaveBeenCalledWith(frame)
  })

  it('remeasures after content or placement updates', () => {
    const view = (content: string, placement: 'top' | 'right') => (
      <AppTooltip content={content} delay={0} placement={placement}>
        <button type="button">Trigger</button>
      </AppTooltip>
    )
    render(view('First', 'top'))
    pointerEnter()
    flushMeasurement()
    expect(tooltip()?.style.visibility).toBe('visible')

    render(view('Updated', 'right'))
    expect(tooltip()?.style.visibility).toBe('hidden')
    expect(vi.mocked(requestAnimationFrame).mock.calls.length).toBeGreaterThan(
      1,
    )
    flushMeasurement()
    expect(tooltip()?.dataset.placement).toBe('right')
  })
})
