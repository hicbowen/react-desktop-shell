// @vitest-environment jsdom

import { act, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppRail } from './AppRail'

const items = [
  { key: 'home', label: 'Home' },
  { key: 'files', label: 'Files' },
]

describe('AppRail scroll hint', () => {
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
    vi.restoreAllMocks()
  })

  const render = (node: ReactNode) => act(() => root.render(node))
  const nav = () => container.querySelector<HTMLElement>('.app-rail__nav')!
  const hint = () =>
    container.querySelector<HTMLElement>('.app-rail__scroll-hint')!
  const scroll = () =>
    act(() => nav().dispatchEvent(new Event('scroll', { bubbles: false })))

  it('does not show the hint when all content fits', () => {
    render(<AppRail items={items} />)

    expect(hint().dataset.visible).toBe('false')
    expect(hint().classList).not.toContain('app-rail__scroll-hint--visible')
  })

  it('shows the hint initially when more content is below', () => {
    scrollHeight = 180
    render(<AppRail items={items} />)

    expect(hint().dataset.visible).toBe('true')
    expect(hint().classList).toContain('app-rail__scroll-hint--visible')
  })

  it('hides the hint after scrolling to the bottom', () => {
    scrollHeight = 180
    render(<AppRail items={items} />)
    nav().scrollTop = 80
    scroll()

    expect(hint().dataset.visible).toBe('false')
  })

  it('shows the hint again after scrolling away from the bottom', () => {
    scrollHeight = 180
    render(<AppRail items={items} />)
    nav().scrollTop = 80
    scroll()
    nav().scrollTop = 40
    scroll()

    expect(hint().dataset.visible).toBe('true')
  })

  it('keeps the overlay non-interactive and menu items clickable', () => {
    const onChange = vi.fn()
    scrollHeight = 180
    render(<AppRail items={items} onChange={onChange} />)

    expect(hint().getAttribute('aria-hidden')).toBe('true')
    expect(hint().parentElement).toBe(nav().parentElement)
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
})
