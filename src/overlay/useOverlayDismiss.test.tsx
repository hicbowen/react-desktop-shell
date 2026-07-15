// @vitest-environment jsdom

import { act, useRef } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useOverlayDismiss } from './useOverlayDismiss'

function Harness({
  open,
  onDismiss,
  restoreFocus = false,
}: {
  open: boolean
  onDismiss: () => void
  restoreFocus?: boolean
}) {
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const overlayRef = useRef<HTMLDivElement | null>(null)

  useOverlayDismiss({
    open,
    overlayRef,
    triggerRef,
    onDismiss,
    restoreFocus,
  })

  return (
    <>
      <button ref={triggerRef}>Trigger</button>
      <div ref={overlayRef}>
        <button>Overlay child</button>
      </div>
      <button>Outside</button>
    </>
  )
}

describe('useOverlayDismiss', () => {
  let container: HTMLDivElement
  let root: Root
  let onDismiss: () => void

  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
      .IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)
    onDismiss = vi.fn()
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
    vi.restoreAllMocks()
  })

  const render = (open = true, restoreFocus = false) =>
    act(() => root.render(<Harness open={open} onDismiss={onDismiss} restoreFocus={restoreFocus} />))
  const buttons = () => container.querySelectorAll<HTMLButtonElement>('button')

  it('dismisses on an outside pointer down', () => {
    render()
    act(() => buttons()[2]?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })))

    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('does not dismiss for the trigger or overlay content', () => {
    render()
    act(() => buttons()[0]?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })))
    act(() => buttons()[1]?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })))

    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('dismisses on Escape and optionally restores trigger focus', () => {
    render(true, true)
    buttons()[2]?.focus()
    act(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })))

    expect(onDismiss).toHaveBeenCalledOnce()
    expect(document.activeElement).toBe(buttons()[0])
  })

  it('dismisses on resize, blur, and external scroll', () => {
    render()
    act(() => window.dispatchEvent(new Event('resize')))
    act(() => window.dispatchEvent(new Event('blur')))
    act(() => window.dispatchEvent(new Event('scroll')))

    expect(onDismiss).toHaveBeenCalledTimes(3)
  })

  it('does not dismiss when the overlay scrolls internally', () => {
    render()
    act(() => buttons()[1]?.dispatchEvent(new Event('scroll')))

    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('does not bind while closed and cleans up after unmount', () => {
    render(false)
    act(() => window.dispatchEvent(new Event('resize')))
    expect(onDismiss).not.toHaveBeenCalled()

    render(true)
    act(() => root.unmount())
    act(() => window.dispatchEvent(new Event('resize')))
    expect(onDismiss).not.toHaveBeenCalled()
  })
})
