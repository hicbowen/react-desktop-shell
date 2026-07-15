// @vitest-environment jsdom

import { act, useRef } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AnchoredOverlayPlacement } from './placement'
import { useAnchoredOverlayPosition } from './useAnchoredOverlayPosition'

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

interface HarnessProps {
  open: boolean
  dependency?: unknown
  preferredPlacement?: AnchoredOverlayPlacement
  triggerRect?: DOMRect | null
  renderTrigger?: boolean
  renderOverlay?: boolean
}

function Harness({
  open,
  dependency,
  preferredPlacement = 'bottom-start',
  triggerRect,
  renderTrigger = true,
  renderOverlay = true,
}: HarnessProps) {
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const position = useAnchoredOverlayPosition({
    open,
    triggerRef,
    triggerRect,
    overlayRef,
    preferredPlacement,
    dependencies: [dependency],
  })

  return (
    <>
      {renderTrigger ? <button ref={triggerRef}>Trigger</button> : null}
      {renderOverlay ? (
        <div
          ref={overlayRef}
          data-max-height={position.maxHeight}
          data-max-width={position.maxWidth}
          data-measured={position.measured}
          data-placement={position.placement}
          style={{ left: position.x, top: position.y }}
        >
          Overlay
        </div>
      ) : null}
    </>
  )
}

describe('useAnchoredOverlayPosition', () => {
  let container: HTMLDivElement
  let root: Root
  let frames: Map<number, FrameRequestCallback>
  let nextFrame: number

  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
      .IS_REACT_ACT_ENVIRONMENT = true
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
        return this.tagName === 'BUTTON'
          ? rect(100, 100, 100, 30)
          : rect(0, 0, 200, 100)
      },
    )
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  const render = (props: HarnessProps) =>
    act(() => root.render(<Harness {...props} />))
  const overlay = () => container.querySelector<HTMLElement>('div')!
  const flushFrame = () => {
    const callback = frames.values().next().value
    frames.clear()
    act(() => callback?.(0))
  }

  it('measures with requestAnimationFrame and exposes the resolved placement', () => {
    render({ open: true, preferredPlacement: 'right-start' })

    expect(requestAnimationFrame).toHaveBeenCalledOnce()
    expect(overlay().dataset.measured).toBe('false')
    flushFrame()

    expect(overlay().dataset.measured).toBe('true')
    expect(overlay().dataset.placement).toBe('right-start')
    expect(overlay().style.left).toBe('204px')
    expect(overlay().style.top).toBe('100px')
    expect(overlay().dataset.maxWidth).toBe('588')
  })

  it('does not measure while closed', () => {
    render({ open: false })

    expect(requestAnimationFrame).not.toHaveBeenCalled()
    expect(overlay().dataset.measured).toBe('false')
  })

  it('cancels a pending frame when unmounted', () => {
    render({ open: true })
    const frame = frames.keys().next().value

    act(() => root.unmount())

    expect(cancelAnimationFrame).toHaveBeenCalledWith(frame)
  })

  it('remeasures when an additional dependency changes', () => {
    render({ open: true, dependency: 1 })
    flushFrame()
    expect(overlay().dataset.measured).toBe('true')

    render({ open: true, dependency: 2 })

    expect(overlay().dataset.measured).toBe('false')
    expect(requestAnimationFrame).toHaveBeenCalledTimes(2)
  })

  it('is safe when the trigger or overlay ref is unavailable', () => {
    render({ open: true, renderTrigger: false })
    flushFrame()
    expect(overlay().dataset.measured).toBe('false')

    render({ open: true, dependency: 2, renderOverlay: false })
    expect(() => flushFrame()).not.toThrow()
  })

  it('supports a trigger rect without a trigger element', () => {
    render({
      open: true,
      preferredPlacement: 'bottom-end',
      renderTrigger: false,
      triggerRect: rect(500, 100, 100, 30),
    })
    flushFrame()

    expect(overlay().dataset.measured).toBe('true')
    expect(overlay().dataset.placement).toBe('bottom-end')
    expect(overlay().style.left).toBe('400px')
  })
})
