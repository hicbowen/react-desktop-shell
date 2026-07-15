// @vitest-environment jsdom

import { act, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppShell } from '../shell/AppShell'
import { AppRail } from './AppRail'
import type { RailEntry } from './types'

const items = [
  { key: 'home', label: 'Home' },
  { key: 'files', label: 'Files' },
]
const flyoutItems: RailEntry[] = [
  {
    type: 'submenu',
    key: 'parent',
    label: 'Parent',
    children: [
      { key: 'child', label: 'Child' },
      { key: 'second', label: 'Second' },
    ],
  },
]

describe('AppRail scroll fade', () => {
  let container: HTMLDivElement
  let root: Root
  let clientHeight: number
  let scrollHeight: number

  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
      .IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)
    clientHeight = 100
    scrollHeight = 100
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(
      () => clientHeight,
    )
    vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockImplementation(
      () => scrollHeight,
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
  const nav = () => container.querySelector<HTMLElement>('.app-rail__nav')!
  const scroll = () =>
    act(() => nav().dispatchEvent(new Event('scroll', { bubbles: false })))
  const openFlyout = () =>
    act(() =>
      Array.from(container.querySelectorAll<HTMLButtonElement>('button'))
        .find((button) => button.getAttribute('aria-label') === 'Parent')
        ?.click(),
    )
  const flyout = () =>
    document.body.querySelector<HTMLElement>('.app-rail-flyout')
  const tooltip = () =>
    document.body.querySelector<HTMLElement>('[role="tooltip"]')
  const hover = (element: Element) => {
    act(() =>
      element.dispatchEvent(
        new PointerEvent('pointerover', { bubbles: true }),
      ),
    )
    act(() => vi.advanceTimersByTime(500))
  }

  it('does not apply the fade when all content fits', () => {
    render(<AppRail items={items} />)

    expect(nav().classList).not.toContain('app-rail__nav--fade-bottom')
  })

  it('applies the fade initially when more content is below', () => {
    scrollHeight = 180
    render(<AppRail items={items} />)

    expect(nav().classList).toContain('app-rail__nav--fade-bottom')
  })

  it('removes the fade after scrolling to the bottom', () => {
    scrollHeight = 180
    render(<AppRail items={items} />)
    nav().scrollTop = 80
    scroll()

    expect(nav().classList).not.toContain('app-rail__nav--fade-bottom')
  })

  it('restores the fade after scrolling away from the bottom', () => {
    scrollHeight = 180
    render(<AppRail items={items} />)
    nav().scrollTop = 80
    scroll()
    nav().scrollTop = 40
    scroll()

    expect(nav().classList).toContain('app-rail__nav--fade-bottom')
  })

  it('does not render an overlay and keeps menu items clickable', () => {
    const onChange = vi.fn()
    scrollHeight = 180
    render(<AppRail items={items} onChange={onChange} />)

    expect(container.querySelector('.app-rail__scroll-hint')).toBeNull()
    act(() =>
      container.querySelector<HTMLButtonElement>('.app-rail__item')?.click(),
    )

    expect(onChange).toHaveBeenCalledWith('home')
  })

  it('assigns depth-based indentation to submenu children', () => {
    render(
      <AppRail
        value="child"
        items={[
          { key: 'home', label: 'Home' },
          {
            type: 'submenu',
            key: 'parent',
            label: 'Parent',
            children: [{ key: 'child', label: 'Child' }],
          },
        ]}
      />,
    )

    const home = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Home',
    )
    const parent = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Parent',
    )
    const child = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Child',
    )

    const homeContent = home?.querySelector<HTMLElement>(
      '.app-rail__item-content',
    )
    const parentContent = parent?.querySelector<HTMLElement>(
      '.app-rail__item-content',
    )
    const childContent = child?.querySelector<HTMLElement>(
      '.app-rail__item-content',
    )

    expect(homeContent?.dataset.depth).toBe('0')
    expect(parentContent?.dataset.depth).toBe('0')
    expect(childContent?.dataset.depth).toBe('1')
    expect(
      childContent?.style.getPropertyValue('--app-rail-item-depth-offset'),
    ).toBe('20px')
    expect(child?.style.getPropertyValue('--app-rail-item-depth-offset')).toBe(
      '',
    )
  })

  it('shows tooltips for collapsed items without native title attributes', () => {
    vi.useFakeTimers()
    const onChange = vi.fn()
    render(<AppRail collapsed items={items} onChange={onChange} />)
    const home = container.querySelector<HTMLButtonElement>(
      '[aria-label="Home"]',
    )!

    expect(home.title).toBe('')
    hover(home)
    expect(tooltip()?.textContent).toBe('Home')
    act(() => home.click())
    expect(onChange).toHaveBeenCalledWith('home')
  })

  it('does not add item tooltips while expanded', () => {
    vi.useFakeTimers()
    render(<AppRail collapsed={false} items={items} />)
    const home = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Home',
    )!

    hover(home)
    expect(tooltip()).toBeNull()
    expect(home.hasAttribute('aria-label')).toBe(false)
  })

  it('supports collapsed footer and disabled item tooltips', () => {
    vi.useFakeTimers()
    render(
      <AppRail
        collapsed
        footerItems={[{ key: 'settings', label: 'Settings' }]}
        items={[{ key: 'disabled', label: 'Disabled', disabled: true }]}
      />,
    )
    const settings = container.querySelector<HTMLButtonElement>(
      '[aria-label="Settings"]',
    )!
    hover(settings)
    expect(tooltip()?.textContent).toBe('Settings')

    act(() =>
      settings.dispatchEvent(
        new PointerEvent('pointerout', { bubbles: true }),
      ),
    )
    const disabled = container.querySelector<HTMLButtonElement>(
      '[aria-label="Disabled"]',
    )!
    const wrapper = disabled.closest('.app-tooltip__trigger-wrapper')!
    hover(wrapper)
    expect(disabled.disabled).toBe(true)
    expect(tooltip()?.textContent).toBe('Disabled')
  })

  it('closes the submenu tooltip when its RailFlyout opens', () => {
    vi.useFakeTimers()
    render(<AppRail collapsed items={flyoutItems} />)
    const parent = container.querySelector<HTMLButtonElement>(
      '[aria-label="Parent"]',
    )!
    hover(parent)
    expect(tooltip()?.textContent).toBe('Parent')

    act(() => parent.click())

    expect(flyout()).not.toBeNull()
    expect(tooltip()).toBeNull()
    expect(parent.title).toBe('')
    expect(parent.getAttribute('aria-label')).toBe('Parent')
  })

  it('portals collapsed submenu flyouts into the AppShell overlay host', () => {
    render(
      <AppShell theme="dark">
        <AppRail collapsed items={flyoutItems} />
      </AppShell>,
    )
    openFlyout()

    const host = container.querySelector('.app-shell__overlay-host')
    expect(host?.contains(flyout())).toBe(true)
    expect(flyout()?.closest('.app-shell')?.getAttribute('data-theme')).toBe(
      'dark',
    )
    expect(
      flyout()?.style.getPropertyValue('--app-rail-flyout-bg'),
    ).toBe('')
  })

  it('falls back to a document.body portal without AppShell', () => {
    render(<AppRail collapsed items={flyoutItems} />)
    openFlyout()

    expect(flyout()).not.toBeNull()
    expect(container.contains(flyout())).toBe(false)
  })

  it('measures before showing and flips right-start to left-start', () => {
    let measure: FrameRequestCallback | undefined
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn((callback: FrameRequestCallback) => {
        measure = callback
        return 1
      }),
    )
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
    vi.stubGlobal('innerWidth', 800)
    vi.stubGlobal('innerHeight', 600)
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      function (this: HTMLElement) {
        if (this.classList.contains('app-rail__submenu-trigger')) {
          return {
            bottom: 140,
            height: 40,
            left: 750,
            right: 790,
            top: 100,
            width: 40,
          } as DOMRect
        }
        if (this.classList.contains('app-rail-flyout')) {
          return {
            bottom: 220,
            height: 120,
            left: 0,
            right: 200,
            top: 100,
            width: 200,
          } as DOMRect
        }
        return {
          bottom: 0,
          height: 0,
          left: 0,
          right: 0,
          top: 0,
          width: 0,
        } as DOMRect
      },
    )

    render(<AppRail collapsed items={flyoutItems} />)
    openFlyout()
    expect(flyout()?.style.visibility).toBe('hidden')

    act(() => measure?.(0))

    expect(flyout()?.style.visibility).toBe('visible')
    expect(flyout()?.dataset.placement).toBe('left-start')
    expect(flyout()?.style.left).toBe('544px')
    expect(flyout()?.style.top).toBe('100px')
    expect(flyout()?.style.maxHeight).toBe('584px')
  })

  it('allows the flyout min-width to shrink in a narrow viewport', () => {
    let measure: FrameRequestCallback | undefined
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn((callback: FrameRequestCallback) => {
        measure = callback
        return 1
      }),
    )
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
    vi.stubGlobal('innerWidth', 100)
    vi.stubGlobal('innerHeight', 600)
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      function (this: HTMLElement) {
        if (this.classList.contains('app-rail__submenu-trigger')) {
          return {
            bottom: 140,
            height: 40,
            left: 8,
            right: 48,
            top: 100,
            width: 40,
          } as DOMRect
        }
        if (this.classList.contains('app-rail-flyout')) {
          return {
            bottom: 220,
            height: 120,
            left: 0,
            right: 180,
            top: 100,
            width: 180,
          } as DOMRect
        }
        return new DOMRect()
      },
    )

    render(<AppRail collapsed items={flyoutItems} />)
    openFlyout()
    act(() => measure?.(0))

    expect(flyout()?.style.maxWidth).toBe('38px')
    expect(flyout()?.style.minWidth).toBe('38px')
    expect(flyout()?.style.left).toBe('54px')
  })

  it('uses right-start when the preferred side has room', async () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      function (this: HTMLElement) {
        if (this.classList.contains('app-rail__submenu-trigger')) {
          return {
            bottom: 140,
            height: 40,
            left: 100,
            right: 140,
            top: 100,
            width: 40,
          } as DOMRect
        }
        return {
          bottom: 220,
          height: 120,
          left: 0,
          right: 200,
          top: 100,
          width: 200,
        } as DOMRect
      },
    )

    render(<AppRail collapsed items={flyoutItems} />)
    openFlyout()
    await act(() => new Promise((resolve) => setTimeout(resolve, 20)))

    expect(flyout()?.dataset.placement).toBe('right-start')
    expect(flyout()?.style.left).toBe('146px')
  })

  it('dismisses on outside interactions and preserves internal scrolling', () => {
    render(<AppRail collapsed items={flyoutItems} />)
    openFlyout()
    act(() => flyout()?.dispatchEvent(new Event('scroll')))
    expect(flyout()).not.toBeNull()

    act(() => window.dispatchEvent(new Event('scroll')))
    expect(flyout()).toBeNull()

    openFlyout()
    act(() => window.dispatchEvent(new Event('resize')))
    expect(flyout()).toBeNull()

    openFlyout()
    act(() => window.dispatchEvent(new Event('blur')))
    expect(flyout()).toBeNull()

    openFlyout()
    act(() =>
      document.body.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true }),
      ),
    )
    expect(flyout()).toBeNull()
  })

  it('closes on Escape, restores trigger focus, and keeps item selection', () => {
    const onChange = vi.fn()
    render(
      <AppRail
        collapsed
        items={flyoutItems}
        onChange={onChange}
      />,
    )
    openFlyout()
    const trigger = Array.from(
      container.querySelectorAll<HTMLButtonElement>('button'),
    ).find((button) => button.getAttribute('aria-label') === 'Parent')!
    trigger.blur()
    act(() =>
      document.dispatchEvent(
        new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }),
      ),
    )

    expect(flyout()).toBeNull()
    expect(document.activeElement).toBe(trigger)

    openFlyout()
    act(() =>
      Array.from(flyout()?.querySelectorAll<HTMLButtonElement>('button') ?? [])
        .find((button) => button.textContent === 'Child')
        ?.click(),
    )
    expect(onChange).toHaveBeenCalledWith('child')
    expect(flyout()).toBeNull()
  })
})
