// @vitest-environment jsdom

import { act, createRef, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppShell } from '../shell/AppShell'
import { AppTooltip } from '../tooltip'
import { AppMenuFlyout } from './AppMenuFlyout'
import type { AppMenuFlyoutEntry } from './types'

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

const defaultItems: AppMenuFlyoutEntry[] = [
  { key: 'rename', label: 'Rename' },
  { key: 'disabled', label: 'Unavailable', disabled: true },
  { type: 'separator' },
  { key: 'copy', label: 'Copy' },
  { key: 'delete', label: 'Delete', danger: true },
]

describe('AppMenuFlyout', () => {
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
    outside.textContent = 'Outside'
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
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      function (this: HTMLElement) {
        if (this.classList.contains('app-menu-flyout')) {
          return rect(0, 0, 200, 160)
        }

        return rect(300, 200, 100, 32)
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
    container.querySelector<HTMLButtonElement>('.menu-trigger')!
  const menu = () => document.body.querySelector<HTMLElement>('[role="menu"]')
  const menuItems = () =>
    Array.from(
      document.body.querySelectorAll<HTMLButtonElement>('[role="menuitem"]'),
    )
  const click = (element: HTMLElement) =>
    act(() =>
      element.dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true }),
      ),
    )
  const pointerDown = (element: HTMLElement) =>
    act(() =>
      element.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true, cancelable: true }),
      ),
    )
  const keyDown = (element: HTMLElement, key: string, shiftKey = false) => {
    let notCancelled = true
    act(() => {
      notCancelled = element.dispatchEvent(
        new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          key,
          shiftKey,
        }),
      )
    })
    return notCancelled
  }
  const flushMeasurement = () => {
    const callbacks = Array.from(frames.values())
    frames.clear()
    act(() => callbacks.forEach((callback) => callback(0)))
  }
  const renderMenu = (
    props: Partial<React.ComponentProps<typeof AppMenuFlyout>> = {},
  ) =>
    render(
      <AppMenuFlyout items={defaultItems} {...props}>
        <button className="menu-trigger" type="button">
          More
        </button>
      </AppMenuFlyout>,
    )

  it('toggles on trigger click and exposes menu ARIA state', () => {
    renderMenu()
    expect(trigger().getAttribute('aria-haspopup')).toBe('menu')
    expect(trigger().getAttribute('aria-expanded')).toBe('false')
    expect(trigger().hasAttribute('aria-controls')).toBe(false)

    click(trigger())
    const menuId = menu()?.id
    expect(menu()).not.toBeNull()
    expect(trigger().getAttribute('aria-expanded')).toBe('true')
    expect(trigger().getAttribute('aria-controls')).toBe(menuId)

    click(trigger())
    expect(menu()).toBeNull()
    expect(trigger().getAttribute('aria-expanded')).toBe('false')
  })

  it('does not open when disabled and closes when disabled changes', () => {
    renderMenu({ disabled: true })
    click(trigger())
    expect(menu()).toBeNull()

    renderMenu({ disabled: false })
    click(trigger())
    expect(menu()).not.toBeNull()

    renderMenu({ disabled: true })
    expect(menu()).toBeNull()
    expect(trigger().getAttribute('aria-expanded')).toBe('false')
    expect(trigger().hasAttribute('aria-controls')).toBe(false)

    renderMenu({ disabled: false })
    expect(menu()).toBeNull()
    click(trigger())
    expect(menu()).not.toBeNull()
  })

  it('closes immediately when open items become empty', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    renderMenu()
    click(trigger())
    expect(menu()).not.toBeNull()
    expect(trigger().getAttribute('aria-expanded')).toBe('true')

    renderMenu({ items: [] })
    expect(menu()).toBeNull()
    expect(trigger().getAttribute('aria-expanded')).toBe('false')
    expect(trigger().hasAttribute('aria-controls')).toBe(false)
    expect(
      consoleError.mock.calls.some((call) =>
        call.some((value) => String(value).includes('Cannot update')),
      ),
    ).toBe(false)
  })

  it('dismisses on outside pointer down but ignores internal pointer down', () => {
    renderMenu()
    click(trigger())
    pointerDown(menuItems()[0]!)
    expect(menu()).not.toBeNull()

    pointerDown(outside)
    expect(menu()).toBeNull()
  })

  it('dismisses on external scroll but ignores menu-internal scroll', () => {
    renderMenu()
    click(trigger())
    act(() => menu()!.dispatchEvent(new Event('scroll')))
    expect(menu()).not.toBeNull()

    act(() => window.dispatchEvent(new Event('scroll')))
    expect(menu()).toBeNull()
  })

  it('dismisses on resize and window blur without forcing trigger focus', () => {
    renderMenu()
    click(trigger())
    act(() => outside.focus())
    act(() => window.dispatchEvent(new Event('resize')))
    expect(menu()).toBeNull()
    expect(document.activeElement).toBe(outside)

    click(trigger())
    act(() => outside.focus())
    act(() => window.dispatchEvent(new Event('blur')))
    expect(menu()).toBeNull()
    expect(document.activeElement).toBe(outside)
  })

  it('closes on Escape and restores trigger focus', () => {
    renderMenu()
    click(trigger())
    flushMeasurement()
    expect(document.activeElement).toBe(menuItems()[0])

    keyDown(menuItems()[0]!, 'Escape')
    expect(menu()).toBeNull()
    expect(document.activeElement).toBe(trigger())
  })

  it('handles Escape once through the document listener', () => {
    renderMenu()
    click(trigger())
    flushMeasurement()
    const focus = vi.spyOn(trigger(), 'focus')

    keyDown(menuItems()[0]!, 'Escape')
    expect(menu()).toBeNull()
    expect(focus).toHaveBeenCalledOnce()
  })

  it('preserves trigger events and lets preventDefault block internal behavior', () => {
    const onClick = vi.fn()
    const onKeyDown = vi.fn()
    render(
      <AppMenuFlyout items={defaultItems}>
        <button
          className="menu-trigger"
          onClick={onClick}
          onKeyDown={onKeyDown}
          type="button"
        >
          More
        </button>
      </AppMenuFlyout>,
    )

    click(trigger())
    expect(onClick).toHaveBeenCalledOnce()
    expect(menu()).not.toBeNull()
    click(trigger())
    keyDown(trigger(), 'ArrowDown')
    expect(onKeyDown).toHaveBeenCalledOnce()
    expect(menu()).not.toBeNull()
    pointerDown(outside)

    render(
      <AppMenuFlyout items={defaultItems}>
        <button
          className="menu-trigger"
          onClick={(event) => event.preventDefault()}
          onKeyDown={(event) => event.preventDefault()}
          type="button"
        >
          More
        </button>
      </AppMenuFlyout>,
    )
    expect(menu()).toBeNull()
    click(trigger())
    expect(menu()).toBeNull()
    keyDown(trigger(), 'ArrowDown')
    expect(menu()).toBeNull()
  })

  it('preserves callback and object refs', () => {
    const callbackRef = vi.fn()
    render(
      <AppMenuFlyout items={defaultItems}>
        <button className="menu-trigger" ref={callbackRef} type="button">
          More
        </button>
      </AppMenuFlyout>,
    )
    expect(callbackRef).toHaveBeenCalledWith(trigger())

    const objectRef = createRef<HTMLButtonElement>()
    render(
      <AppMenuFlyout items={defaultItems}>
        <button className="menu-trigger" ref={objectRef} type="button">
          More
        </button>
      </AppMenuFlyout>,
    )
    expect(objectRef.current).toBe(trigger())
  })

  it('portals to the AppShell overlay host and otherwise falls back to body', () => {
    renderMenu()
    click(trigger())
    expect(container.contains(menu())).toBe(false)
    expect(menu()?.parentElement).toBe(document.body)
    expect(getComputedStyle(menu()!).backgroundColor).not.toBe(
      'rgba(0, 0, 0, 0)',
    )

    render(
      <AppShell theme="dark">
        <AppMenuFlyout items={defaultItems}>
          <button className="menu-trigger" type="button">
            More
          </button>
        </AppMenuFlyout>
      </AppShell>,
    )
    click(trigger())
    const host = container.querySelector('.app-shell__overlay-host')
    expect(host?.contains(menu())).toBe(true)
    expect(menu()?.closest('.app-shell')?.getAttribute('data-theme')).toBe(
      'dark',
    )
  })

  it('starts hidden and shows at the default bottom-start placement after measurement', () => {
    renderMenu()
    click(trigger())
    expect(menu()?.style.visibility).toBe('hidden')
    expect(menu()?.dataset.placement).toBe('bottom-start')

    flushMeasurement()
    expect(menu()?.style.visibility).toBe('visible')
    expect(menu()?.dataset.placement).toBe('bottom-start')
    expect(menu()?.style.left).toBe('300px')
    expect(menu()?.style.top).toBe('237px')
  })

  it('flips upward and clamps horizontally when space is limited', () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      function (this: HTMLElement) {
        if (this.classList.contains('app-menu-flyout')) {
          return rect(0, 0, 200, 160)
        }

        return rect(760, 560, 40, 32)
      },
    )
    renderMenu()
    click(trigger())
    flushMeasurement()

    expect(menu()?.dataset.placement).toBe('top-start')
    expect(menu()?.style.left).toBe('592px')
    expect(menu()?.style.top).toBe('395px')
  })

  it('applies dynamic limits and shrinks safely in an extremely narrow viewport', () => {
    vi.stubGlobal('innerWidth', 100)
    renderMenu({ maxHeight: 120, maxWidth: 320 })
    click(trigger())
    flushMeasurement()

    expect(menu()?.style.maxHeight).toBe('120px')
    expect(menu()?.style.maxWidth).toBe('84px')
    expect(menu()?.style.minWidth).toBe('84px')
    expect(menu()?.style.left).toBe('8px')
  })

  it('renders icons, danger styling, disabled items, and separators', () => {
    const onSelect = vi.fn()
    renderMenu({
      onSelect,
      items: [
        { key: 'icon', label: 'With icon', icon: <span data-icon="yes" /> },
        { key: 'disabled', label: 'Disabled', disabled: true },
        { type: 'separator' },
        { key: 'danger', label: 'Danger', danger: true },
      ],
    })
    click(trigger())
    const items = menuItems()
    const separator = menu()?.querySelector('[role="separator"]')

    expect(menu()?.querySelector('[data-icon="yes"]')).not.toBeNull()
    expect(items[1]?.disabled).toBe(true)
    click(items[1]!)
    expect(onSelect).not.toHaveBeenCalled()
    expect(items[2]?.classList.contains('app-menu-flyout__item--danger')).toBe(
      true,
    )
    expect(separator).not.toBeNull()
    expect(separator?.hasAttribute('tabindex')).toBe(false)
  })

  it('does not open an empty menu', () => {
    renderMenu({ items: [] })
    click(trigger())
    expect(menu()).toBeNull()
    expect(keyDown(trigger(), 'ArrowDown')).toBe(true)
    expect(menu()).toBeNull()
  })

  it('opens an all-disabled menu and focuses its root container', () => {
    renderMenu({
      items: [
        { key: 'disabled', label: 'Unavailable', disabled: true },
        { type: 'separator' },
      ],
    })
    click(trigger())
    expect(menu()).not.toBeNull()
    flushMeasurement()
    expect(menu()?.tabIndex).toBe(-1)
    expect(document.activeElement).toBe(menu())

    keyDown(menu()!, 'Escape')
    expect(menu()).toBeNull()
    expect(document.activeElement).toBe(trigger())
  })

  it('selects an item, closes, and restores trigger focus', () => {
    const onSelect = vi.fn()
    renderMenu({ onSelect })
    click(trigger())
    flushMeasurement()
    click(menuItems()[2]!)

    expect(onSelect).toHaveBeenCalledWith('copy')
    expect(menu()).toBeNull()
    expect(document.activeElement).toBe(trigger())
  })

  it('opens with ArrowDown or click on the first item and ArrowUp on the last item', () => {
    renderMenu()
    keyDown(trigger(), 'ArrowDown')
    flushMeasurement()
    expect(document.activeElement).toBe(menuItems()[0])

    keyDown(menuItems()[0]!, 'Escape')
    keyDown(trigger(), 'ArrowUp')
    flushMeasurement()
    expect(document.activeElement).toBe(menuItems()[3])

    keyDown(menuItems()[3]!, 'Escape')
    click(trigger())
    flushMeasurement()
    expect(document.activeElement).toBe(menuItems()[0])
  })

  it('cycles with arrows and skips disabled items and separators', () => {
    renderMenu()
    click(trigger())
    flushMeasurement()
    keyDown(menuItems()[0]!, 'ArrowDown')
    expect(document.activeElement).toBe(menuItems()[2])
    keyDown(menuItems()[2]!, 'ArrowDown')
    expect(document.activeElement).toBe(menuItems()[3])
    keyDown(menuItems()[3]!, 'ArrowDown')
    expect(document.activeElement).toBe(menuItems()[0])
    keyDown(menuItems()[0]!, 'ArrowUp')
    expect(document.activeElement).toBe(menuItems()[3])
  })

  it('supports Home and End navigation', () => {
    renderMenu()
    click(trigger())
    flushMeasurement()
    keyDown(menuItems()[0]!, 'End')
    expect(document.activeElement).toBe(menuItems()[3])
    keyDown(menuItems()[3]!, 'Home')
    expect(document.activeElement).toBe(menuItems()[0])
  })

  it('activates the current item with Enter and Space', () => {
    const onSelect = vi.fn()
    renderMenu({ onSelect })
    click(trigger())
    flushMeasurement()
    keyDown(menuItems()[0]!, 'Enter')
    expect(onSelect).toHaveBeenLastCalledWith('rename')
    expect(menu()).toBeNull()

    click(trigger())
    flushMeasurement()
    keyDown(menuItems()[0]!, 'ArrowDown')
    keyDown(menuItems()[2]!, ' ')
    expect(onSelect).toHaveBeenLastCalledWith('copy')
    expect(menu()).toBeNull()
  })

  it('restores the trigger before Tab closes without preventing default', () => {
    renderMenu()
    click(trigger())
    flushMeasurement()
    const notCancelled = keyDown(menuItems()[0]!, 'Tab')

    expect(notCancelled).toBe(true)
    expect(menu()).toBeNull()
    expect(document.activeElement).toBe(trigger())
  })

  it('restores the trigger before Shift+Tab closes without preventing default', () => {
    renderMenu()
    click(trigger())
    flushMeasurement()
    const notCancelled = keyDown(menuItems()[0]!, 'Tab', true)

    expect(notCancelled).toBe(true)
    expect(menu()).toBeNull()
    expect(document.activeElement).toBe(trigger())
  })

  it('composes through AppTooltip without losing ARIA, click, or refs', () => {
    render(
      <AppMenuFlyout items={defaultItems}>
        <AppTooltip content="More actions" delay={0}>
          <button className="menu-trigger" type="button">
            More
          </button>
        </AppTooltip>
      </AppMenuFlyout>,
    )
    act(() => trigger().focus())
    expect(document.body.querySelector('[role="tooltip"]')).not.toBeNull()
    expect(trigger().getAttribute('aria-haspopup')).toBe('menu')

    click(trigger())
    expect(menu()).not.toBeNull()
    expect(document.body.querySelector('[role="tooltip"]')).toBeNull()
  })
})
