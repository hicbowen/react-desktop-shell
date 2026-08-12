// @vitest-environment jsdom

import { act, createRef } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppSpotlightSurface } from './AppSpotlightSurface'

describe('AppSpotlightSurface', () => {
  let host: HTMLDivElement
  let root: Root

  beforeEach(() => {
    ;(
      globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
  })

  afterEach(() => {
    act(() => root.unmount())
    host.remove()
  })

  it('moves focus into the surface and restores it after Escape', () => {
    const inputRef = createRef<HTMLInputElement>()
    const triggerRef = createRef<HTMLButtonElement>()
    const onOpenChange = vi.fn()
    const render = (open: boolean) =>
      act(() =>
        root.render(
          <>
            <button ref={triggerRef} type="button">
              Open
            </button>
            <AppSpotlightSurface
              ariaLabel="Quick surface"
              initialFocusRef={inputRef}
              onOpenChange={onOpenChange}
              open={open}
            >
              <input ref={inputRef} />
            </AppSpotlightSurface>
          </>,
        ),
      )

    render(false)
    triggerRef.current?.focus()
    render(true)
    expect(document.activeElement).toBe(inputRef.current)
    expect(
      document.body
        .querySelector('[role="dialog"]')
        ?.getAttribute('aria-label'),
    ).toBe('Quick surface')

    act(() =>
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          key: 'Escape',
        }),
      ),
    )
    expect(onOpenChange).toHaveBeenCalledWith(false)

    render(false)
    expect(document.activeElement).toBe(triggerRef.current)
  })

  it('dismisses on an outside pointer and keeps Tab focus inside', () => {
    const onOpenChange = vi.fn()
    act(() =>
      root.render(
        <AppSpotlightSurface
          ariaLabel="Quick surface"
          onOpenChange={onOpenChange}
          open
        >
          <button type="button">First</button>
          <button type="button">Last</button>
        </AppSpotlightSurface>,
      ),
    )

    const buttons = document.body.querySelectorAll<HTMLButtonElement>(
      '.app-spotlight-surface button',
    )
    buttons[1]?.focus()
    act(() =>
      buttons[1]?.dispatchEvent(
        new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          key: 'Tab',
        }),
      ),
    )
    expect(document.activeElement).toBe(buttons[0])

    act(() =>
      document.body
        .querySelector('.app-spotlight-layer')
        ?.dispatchEvent(
          new MouseEvent('pointerdown', { bubbles: true, cancelable: true }),
        ),
    )
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
