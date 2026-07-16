// @vitest-environment jsdom

import { act, createRef, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppShell } from '../shell/AppShell'
import { AppTeachingTip } from './AppTeachingTip'

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

describe('AppTeachingTip', () => {
  let container: HTMLDivElement
  let outside: HTMLButtonElement
  let root: Root
  let frames: Map<number, FrameRequestCallback>
  let nextFrame: number

  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
      .IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement('div')
    outside = document.createElement('button')
    document.body.append(container, outside)
    root = createRoot(container)
    frames = new Map()
    nextFrame = 1
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn((callback: FrameRequestCallback) => {
        const id = nextFrame++
        frames.set(id, callback)
        return id
      }),
    )
    vi.stubGlobal(
      'cancelAnimationFrame',
      vi.fn((id: number) => frames.delete(id)),
    )
    vi.stubGlobal('innerWidth', 800)
    vi.stubGlobal('innerHeight', 600)
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      function (this: HTMLElement) {
        return this.classList.contains('app-teaching-tip')
          ? rect(0, 0, 260, 160)
          : rect(300, 200, 100, 32)
      },
    )
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
    outside.remove()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  const render = (node: ReactNode) => act(() => root.render(node))
  const trigger = () =>
    container.querySelector<HTMLButtonElement>('.tip-trigger')!
  const tip = () => document.body.querySelector<HTMLElement>('[role="dialog"]')
  const flushMeasurement = () => {
    const callbacks = Array.from(frames.values())
    frames.clear()
    act(() => callbacks.forEach((callback) => callback(0)))
  }
  const pointerDown = (element: HTMLElement) =>
    act(() =>
      element.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true, cancelable: true }),
      ),
    )
  const renderTip = (
    props: Partial<React.ComponentProps<typeof AppTeachingTip>> = {},
  ) =>
    render(
      <AppTeachingTip
        content="Now you can export multiple records."
        onOpenChange={() => undefined}
        open
        title="New feature"
        {...props}
      >
        <button className="tip-trigger" type="button">
          Export
        </button>
      </AppTeachingTip>,
    )

  it('renders only while controlled open is true', () => {
    renderTip({ open: false })
    expect(tip()).toBeNull()
    expect(trigger().hasAttribute('aria-expanded')).toBe(false)

    renderTip({ open: true })
    expect(tip()).not.toBeNull()
    expect(trigger().hasAttribute('aria-expanded')).toBe(false)
  })

  it('does not overwrite the child aria-expanded state', () => {
    render(
      <AppTeachingTip content="Content" onOpenChange={() => undefined} open>
        <button aria-expanded="false" className="tip-trigger" type="button">
          Trigger
        </button>
      </AppTeachingTip>,
    )
    expect(trigger().getAttribute('aria-expanded')).toBe('false')

    render(
      <AppTeachingTip content="Content" onOpenChange={() => undefined} open={false}>
        <button aria-expanded="true" className="tip-trigger" type="button">
          Trigger
        </button>
      </AppTeachingTip>,
    )
    expect(trigger().getAttribute('aria-expanded')).toBe('true')
  })

  it('portals into AppShell and otherwise falls back to styled body content', () => {
    renderTip()
    expect(tip()?.parentElement).toBe(document.body)
    expect(getComputedStyle(tip()!).backgroundColor).not.toBe(
      'rgba(0, 0, 0, 0)',
    )

    render(
      <AppShell theme="dark">
        <AppTeachingTip content="Content" onOpenChange={() => undefined} open>
          <button className="tip-trigger" type="button">Trigger</button>
        </AppTeachingTip>
      </AppShell>,
    )
    const host = container.querySelector('.app-shell__overlay-host')
    expect(host?.contains(tip())).toBe(true)
    expect(tip()?.closest('.app-shell')?.getAttribute('data-theme')).toBe('dark')
  })

  it('stays hidden until measured and writes the final placement', () => {
    renderTip({ placement: 'right' })
    expect(tip()?.style.visibility).toBe('hidden')
    flushMeasurement()
    expect(tip()?.style.visibility).toBe('visible')
    expect(tip()?.dataset.placement).toBe('right')
    expect(tip()?.style.left).toBe('408px')
  })

  it('automatically flips and constrains width near the viewport edge', () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      function (this: HTMLElement) {
        return this.classList.contains('app-teaching-tip')
          ? rect(0, 0, 360, 160)
          : rect(760, 200, 32, 32)
      },
    )
    renderTip({ maxWidth: 360, placement: 'right' })
    flushMeasurement()
    expect(tip()?.dataset.placement).toBe('left')
    expect(tip()?.style.maxWidth).toBe('360px')
    expect(tip()?.style.left).toBe('392px')
  })

  it('closes from the dismiss button and hides it when not dismissible', () => {
    const onOpenChange = vi.fn()
    renderTip({ onOpenChange })
    act(() => tip()?.querySelector<HTMLButtonElement>('[aria-label="Close"]')?.click())
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(document.activeElement).toBe(trigger())

    renderTip({ dismissible: false, onOpenChange })
    expect(tip()?.querySelector('[aria-label="Close"]')).toBeNull()
  })

  it('uses the built-in close aria-label', () => {
    renderTip()
    expect(tip()?.querySelector('[aria-label="Close"]')).not.toBeNull()
  })

  it('closes on Escape and restores trigger focus', () => {
    const onOpenChange = vi.fn()
    renderTip({ onOpenChange })
    act(() => outside.focus())
    act(() =>
      document.dispatchEvent(
        new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }),
      ),
    )
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(document.activeElement).toBe(trigger())
  })

  it('closes on outside pointer down without taking focus', () => {
    const onOpenChange = vi.fn()
    renderTip({ onOpenChange })
    act(() => outside.focus())
    pointerDown(outside)
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(document.activeElement).toBe(outside)
  })

  it('can ignore outside pointer down', () => {
    const onOpenChange = vi.fn()
    renderTip({ closeOnOutsidePointerDown: false, onOpenChange })
    pointerDown(outside)
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('ignores internal pointer down and internal scroll', () => {
    const onOpenChange = vi.fn()
    renderTip({ onOpenChange })
    pointerDown(tip()!)
    act(() => tip()!.dispatchEvent(new Event('scroll')))
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('requests close only once per open cycle and resets after reopening', () => {
    const onOpenChange = vi.fn()
    renderTip({ onOpenChange })
    act(() => window.dispatchEvent(new Event('scroll')))
    act(() => window.dispatchEvent(new Event('resize')))
    act(() => window.dispatchEvent(new Event('blur')))
    expect(onOpenChange).toHaveBeenCalledTimes(1)
    expect(onOpenChange).toHaveBeenCalledWith(false)

    renderTip({ onOpenChange, open: false })
    renderTip({ onOpenChange, open: true })
    act(() => window.dispatchEvent(new Event('blur')))
    expect(onOpenChange).toHaveBeenCalledTimes(2)
  })

  it('runs the primary action, closes, and restores trigger focus', () => {
    const action = vi.fn()
    const onOpenChange = vi.fn()
    renderTip({
      onOpenChange,
      primaryAction: { label: 'Got it', onClick: action },
    })
    act(() => tip()?.querySelector<HTMLButtonElement>('.app-teaching-tip__action--primary')?.click())
    expect(action).toHaveBeenCalledOnce()
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(document.activeElement).toBe(trigger())
  })

  it('runs the secondary action and closes', () => {
    const action = vi.fn()
    const onOpenChange = vi.fn()
    renderTip({
      onOpenChange,
      secondaryAction: { label: 'Later', onClick: action },
    })
    act(() => tip()?.querySelector<HTMLButtonElement>('.app-teaching-tip__action--secondary')?.click())
    expect(action).toHaveBeenCalledOnce()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('closes and restores focus even when an action throws', () => {
    const onOpenChange = vi.fn()
    const error = new Error('Action failed')
    renderTip({
      onOpenChange,
      primaryAction: {
        label: 'Failing action',
        onClick: () => {
          throw error
        },
      },
    })
    const button = tip()?.querySelector<HTMLButtonElement>(
      '.app-teaching-tip__action--primary',
    )
    const reportedErrors: unknown[] = []
    const handleError = (event: ErrorEvent) => {
      reportedErrors.push(event.error)
      event.preventDefault()
    }
    window.addEventListener('error', handleError)

    act(() => button?.click())
    window.removeEventListener('error', handleError)
    expect(reportedErrors).toContain(error)
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(document.activeElement).toBe(trigger())
  })

  it('preserves child refs and existing descriptions', () => {
    const ref = createRef<HTMLButtonElement>()
    render(
      <AppTeachingTip content="Tip content" onOpenChange={() => undefined} open>
        <button
          aria-describedby="existing"
          className="tip-trigger"
          ref={ref}
          type="button"
        >
          Trigger
        </button>
      </AppTeachingTip>,
    )
    const contentId = tip()?.getAttribute('aria-describedby')
    expect(ref.current).toBe(trigger())
    expect(trigger().getAttribute('aria-describedby')).toBe(
      `existing ${contentId}`,
    )
  })

  it('connects title and content ARIA, with an aria-label fallback', () => {
    renderTip({ title: 'Feature title' })
    expect(tip()?.getAttribute('aria-labelledby')).toBe(
      tip()?.querySelector('.app-teaching-tip__title')?.id,
    )
    expect(tip()?.getAttribute('aria-describedby')).toBe(
      tip()?.querySelector('.app-teaching-tip__content')?.id,
    )

    renderTip({ ariaLabel: 'Export guidance', title: undefined })
    expect(tip()?.getAttribute('aria-label')).toBe('Export guidance')
    expect(tip()?.hasAttribute('aria-labelledby')).toBe(false)
  })

  it('does not remeasure for equivalent ReactNode structures', () => {
    const view = (iteration: number) => (
      <AppTeachingTip
        content={<span>Stable content</span>}
        onOpenChange={() => undefined}
        open
        primaryAction={{ label: <span>Continue</span>, onClick: () => undefined }}
        title={<span>Stable title</span>}
      >
        <button className="tip-trigger" type="button">Trigger {iteration}</button>
      </AppTeachingTip>
    )
    render(view(1))
    flushMeasurement()
    const measurements = vi.mocked(requestAnimationFrame).mock.calls.length

    render(view(2))
    expect(vi.mocked(requestAnimationFrame).mock.calls.length).toBe(measurements)
    expect(tip()?.style.visibility).toBe('visible')
  })

  it('remeasures when string content changes', () => {
    const view = (content: string) => (
      <AppTeachingTip content={content} onOpenChange={() => undefined} open>
        <button className="tip-trigger" type="button">Trigger</button>
      </AppTeachingTip>
    )
    render(view('First content'))
    flushMeasurement()
    const measurements = vi.mocked(requestAnimationFrame).mock.calls.length

    render(view('Updated content'))
    expect(vi.mocked(requestAnimationFrame).mock.calls.length).toBeGreaterThan(
      measurements,
    )
    expect(tip()?.style.visibility).toBe('hidden')
  })
})
