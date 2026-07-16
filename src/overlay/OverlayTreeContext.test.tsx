// @vitest-environment jsdom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppMenuFlyout } from '../menu-flyout/AppMenuFlyout'
import { AppPopover } from '../popover/AppPopover'

describe('overlay tree coordination', () => {
  let container: HTMLDivElement
  let root: Root
  let frames: FrameRequestCallback[]

  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
      .IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)
    frames = []
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
      right: 220,
      top: 100,
      width: 120,
    } as DOMRect)
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  const flushFrames = () =>
    act(() => {
      while (frames.length > 0) frames.shift()?.(0)
    })
  const pointerDown = (target: EventTarget) =>
    act(() => {
      target.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          cancelable: true,
        }),
      )
    })
  const click = (target: HTMLElement) =>
    act(() => {
      target.dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true }),
      )
    })

  function renderNested(onSelect = vi.fn()) {
    act(() =>
      root.render(
        <AppPopover
          defaultOpen
          trigger={<button type="button">Parent trigger</button>}
        >
          <div className="parent-content">
            Parent content
            <AppMenuFlyout
              items={[{ key: 'child-action', label: 'Child action' }]}
              onSelect={onSelect}
            >
              <button className="child-trigger" type="button">
                Child menu
              </button>
            </AppMenuFlyout>
          </div>
        </AppPopover>,
      ),
    )

    click(document.querySelector<HTMLButtonElement>('.child-trigger')!)
    flushFrames()
    return onSelect
  }

  it('treats a portaled child menu as part of its parent branch', () => {
    const onSelect = renderNested()
    const item = document.querySelector<HTMLButtonElement>('[role="menuitem"]')!

    pointerDown(item)
    click(item)

    expect(onSelect).toHaveBeenCalledOnce()
    expect(document.querySelector('.app-menu-flyout')).toBeNull()
    expect(document.querySelector('.app-popover')).not.toBeNull()
  })

  it('dismisses only the deepest overlay on each Escape', () => {
    renderNested()

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          key: 'Escape',
        }),
      )
    })
    expect(document.querySelector('.app-menu-flyout')).toBeNull()
    expect(document.querySelector('.app-popover')).not.toBeNull()

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          key: 'Escape',
        }),
      )
    })
    expect(document.querySelector('.app-popover')).toBeNull()
  })

  it('closes a child when its parent surface is pressed', () => {
    renderNested()

    pointerDown(document.querySelector('.parent-content')!)

    expect(document.querySelector('.app-menu-flyout')).toBeNull()
    expect(document.querySelector('.app-popover')).not.toBeNull()
  })

  it('does not treat an unrelated popover trigger as a branch', () => {
    act(() =>
      root.render(
        <>
          <AppPopover
            defaultOpen
            trigger={<button type="button">First trigger</button>}
          >
            First popover
          </AppPopover>
          <AppPopover trigger={<button type="button">Second trigger</button>}>
            Second popover
          </AppPopover>
        </>,
      ),
    )

    const secondTrigger = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Second trigger',
    )!
    pointerDown(secondTrigger)
    click(secondTrigger)

    const popovers = document.querySelectorAll('.app-popover')
    expect(popovers).toHaveLength(1)
    expect(popovers[0]?.textContent).toBe('Second popover')
  })
})
