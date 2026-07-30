// @vitest-environment jsdom

import { act, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppHoverCard } from './AppHoverCard'

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

describe('AppHoverCard', () => {
  let container: HTMLDivElement
  let outside: HTMLButtonElement
  let root: Root
  let frames: Map<number, FrameRequestCallback>
  let nextFrame: number

  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
      .IS_REACT_ACT_ENVIRONMENT = true
    vi.useFakeTimers()
    container = document.createElement('div')
    outside = document.createElement('button')
    document.body.append(container, outside)
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
    vi.spyOn(
      HTMLElement.prototype,
      'getBoundingClientRect',
    ).mockImplementation(function (this: HTMLElement) {
      if (this.classList.contains('app-hover-card')) {
        return rect(0, 0, 280, 160)
      }
      return rect(300, 200, 120, 32)
    })
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
    outside.remove()
    vi.useRealTimers()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  const render = (node: ReactNode) => act(() => root.render(node))
  const trigger = () =>
    container.querySelector<HTMLButtonElement>('.hover-card-trigger')!
  const card = () =>
    document.body.querySelector<HTMLElement>('.app-hover-card')
  const pointerEnter = (element: HTMLElement) =>
    act(() =>
      element.dispatchEvent(
        new PointerEvent('pointerover', { bubbles: true }),
      ),
    )
  const pointerLeave = (element: HTMLElement) =>
    act(() =>
      element.dispatchEvent(
        new PointerEvent('pointerout', { bubbles: true }),
      ),
    )
  const advance = (duration: number) =>
    act(() => vi.advanceTimersByTime(duration))
  const renderCard = (
    props: Partial<React.ComponentProps<typeof AppHoverCard>> = {},
  ) =>
    render(
      <AppHoverCard
        ariaLabel="Project details"
        content={<input aria-label="Project name" />}
        {...props}
      >
        <button className="hover-card-trigger" type="button">
          Project
        </button>
      </AppHoverCard>,
    )

  it('opens after its delay and closes after its leave delay', () => {
    renderCard({ openDelay: 400, closeDelay: 200 })
    pointerEnter(trigger())
    advance(399)
    expect(card()).toBeNull()

    advance(1)
    expect(card()).not.toBeNull()
    pointerLeave(trigger())
    advance(199)
    expect(card()).not.toBeNull()
    advance(1)
    expect(card()).toBeNull()
  })

  it('keeps the card open while the pointer moves into it', () => {
    renderCard({ openDelay: 0, closeDelay: 200 })
    pointerEnter(trigger())
    const surface = card()!

    pointerLeave(trigger())
    pointerEnter(surface)
    advance(200)
    expect(card()).not.toBeNull()

    pointerLeave(surface)
    advance(200)
    expect(card()).toBeNull()
  })

  it('opens on focus and stays open while focus is inside', () => {
    renderCard({ closeDelay: 100 })
    act(() => trigger().focus())
    expect(card()).not.toBeNull()

    act(() =>
      card()?.querySelector<HTMLInputElement>('input')?.focus(),
    )
    advance(100)
    expect(card()).not.toBeNull()

    act(() => outside.focus())
    advance(100)
    expect(card()).toBeNull()
  })

  it('pins on click until clicked again', () => {
    renderCard({ closeDelay: 50 })
    act(() => trigger().click())
    expect(card()).not.toBeNull()

    pointerLeave(trigger())
    advance(50)
    expect(card()).not.toBeNull()

    act(() => trigger().click())
    expect(card()).toBeNull()
  })

  it('dismisses a pinned card on outside pointer down', () => {
    renderCard()
    act(() => trigger().click())
    expect(card()).not.toBeNull()

    act(() =>
      outside.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          cancelable: true,
        }),
      ),
    )
    expect(card()).toBeNull()
  })

  it('restores trigger focus on Escape from interactive content', () => {
    renderCard()
    act(() => trigger().click())
    act(() =>
      card()?.querySelector<HTMLInputElement>('input')?.focus(),
    )

    act(() =>
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          key: 'Escape',
        }),
      ),
    )

    expect(card()).toBeNull()
    expect(document.activeElement).toBe(trigger())
  })

  it('preserves trigger and interactive content events', () => {
    const triggerClick = vi.fn()
    const contentClick = vi.fn()
    render(
      <AppHoverCard
        ariaLabel="Actions"
        content={
          <button onClick={contentClick} type="button">
            Run
          </button>
        }
        openDelay={0}
      >
        <button
          className="hover-card-trigger"
          onClick={triggerClick}
          type="button"
        >
          Project
        </button>
      </AppHoverCard>,
    )

    pointerEnter(trigger())
    act(() =>
      card()?.querySelector<HTMLButtonElement>('button')?.click(),
    )
    expect(triggerClick).not.toHaveBeenCalled()
    expect(contentClick).toHaveBeenCalledOnce()
    expect(card()).not.toBeNull()

    act(() => trigger().click())
    expect(triggerClick).toHaveBeenCalledOnce()
  })

  it('supports controlled state and disabled content', () => {
    const change = vi.fn()
    renderCard({ onOpenChange: change, open: false })
    pointerEnter(trigger())
    advance(500)
    expect(change).toHaveBeenCalledWith(true)
    expect(card()).toBeNull()

    renderCard({ disabled: true, openDelay: 0 })
    pointerEnter(trigger())
    act(() => trigger().click())
    expect(card()).toBeNull()
  })
})
