// @vitest-environment jsdom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppTabView } from './AppTabView'
import type { AppTabViewItem } from './types'

const items: AppTabViewItem[] = [
  { key: 'one', label: 'One', content: 'First panel' },
  { key: 'two', label: 'Two', content: 'Second panel' },
  { key: 'three', label: 'Three', content: 'Third panel' },
]

describe('AppTabView', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
  })

  const render = (props: Partial<React.ComponentProps<typeof AppTabView>> = {}) => {
    act(() => root.render(<AppTabView items={items} {...props} />))
  }

  const tab = (label: string) => Array.from(container.querySelectorAll<HTMLButtonElement>('[role="tab"]')).find((node) => node.textContent === label)!

  it('selects and renders the first tab by default', () => {
    render()
    expect(tab('One').getAttribute('aria-selected')).toBe('true')
    expect(container.querySelector('[role="tabpanel"]')?.textContent).toBe('First panel')
  })

  it('changes an uncontrolled selection on click', () => {
    const onValueChange = vi.fn()
    render({ onValueChange })
    act(() => tab('Two').click())
    expect(tab('Two').getAttribute('aria-selected')).toBe('true')
    expect(onValueChange).toHaveBeenCalledWith('two')
  })

  it('keeps controlled selection unchanged', () => {
    const onValueChange = vi.fn()
    render({ value: 'one', onValueChange })
    act(() => tab('Two').click())
    expect(tab('One').getAttribute('aria-selected')).toBe('true')
    expect(onValueChange).toHaveBeenCalledWith('two')
  })

  it('supports arrow, home, and end navigation', () => {
    render()
    act(() => tab('One').dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowLeft' })))
    expect(tab('Three').getAttribute('aria-selected')).toBe('true')
    act(() => tab('Three').dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Home' })))
    expect(tab('One').getAttribute('aria-selected')).toBe('true')
  })

  it('requests close without owning the collection', () => {
    const onTabClose = vi.fn()
    render({ onTabClose })
    const close = container.querySelector<HTMLButtonElement>('[aria-label="Close One"]')!
    act(() => close.click())
    expect(onTabClose).toHaveBeenCalledWith('one')
    expect(tab('One')).toBeTruthy()
  })

  it('reports the tab that requests a context menu', () => {
    const onTabContextMenu = vi.fn()
    render({ onTabContextMenu })
    const shell = tab('Two').closest('.app-tab-view__tab-shell')!
    act(() => shell.dispatchEvent(new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
    })))
    expect(onTabContextMenu).toHaveBeenCalledOnce()
    expect(onTabContextMenu.mock.calls[0]?.[0]).toBe(items[1])
    expect(onTabContextMenu.mock.calls[0]?.[1].nativeEvent).toBeInstanceOf(MouseEvent)
  })

  it('keeps the add action in the scrollable tab row', () => {
    render({ onAddTab: vi.fn() })
    const tabs = container.querySelector('.app-tab-view__tabs')
    const add = container.querySelector('[aria-label="New tab"]')
    expect(add?.parentElement).toBe(tabs)
  })

  it('maps a vertical mouse wheel to horizontal tab scrolling', () => {
    render()
    const tabs = container.querySelector<HTMLElement>('.app-tab-view__tabs')!
    Object.defineProperties(tabs, {
      clientWidth: { configurable: true, value: 300 },
      scrollWidth: { configurable: true, value: 600 },
    })
    tabs.scrollLeft = 0
    act(() => tabs.dispatchEvent(new WheelEvent('wheel', {
      bubbles: true,
      cancelable: true,
      deltaY: 80,
    })))
    expect(tabs.scrollLeft).toBe(80)
  })

  it('scrolls to the end when a tab is added', () => {
    render()
    const tabs = container.querySelector<HTMLElement>('.app-tab-view__tabs')!
    Object.defineProperty(tabs, 'scrollWidth', {
      configurable: true,
      value: 720,
    })
    act(() => root.render(<AppTabView
      items={[...items, { key: 'four', label: 'Four', content: 'Fourth panel' }]}
    />))
    expect(tabs.scrollLeft).toBe(720)
  })

  it('keeps inactive panels mounted when requested', () => {
    render({ mountStrategy: 'hidden' })
    const panels = container.querySelectorAll<HTMLElement>('[role="tabpanel"]')
    expect(panels).toHaveLength(3)
    expect(panels[1].hidden).toBe(true)
  })

  it('skips disabled tabs when resolving selection', () => {
    act(() => root.render(<AppTabView items={[{ ...items[0], disabled: true }, items[1]]} />))
    expect(tab('Two').getAttribute('aria-selected')).toBe('true')
  })
})
