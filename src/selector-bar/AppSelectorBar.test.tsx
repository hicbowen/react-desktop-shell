// @vitest-environment jsdom

import { act, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppSelectorBar } from './AppSelectorBar'
import type { AppSelectorBarItem } from './types'

const items: AppSelectorBarItem[] = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'done', label: 'Done' },
]

describe('AppSelectorBar', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
      .IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
  })

  const render = (element: React.ReactNode) => {
    act(() => root.render(element))
  }

  const radio = (name: string) =>
    Array.from(container.querySelectorAll<HTMLButtonElement>('[role="radio"]'))
      .find((item) => item.textContent?.includes(name))!

  const press = (element: HTMLElement, key: string) => {
    act(() =>
      element.dispatchEvent(
        new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key }),
      ),
    )
  }

  it('selects the first available item by default', () => {
    render(
      <AppSelectorBar
        items={[{ key: 'disabled', label: 'Disabled', disabled: true }, ...items]}
      />,
    )

    expect(radio('Disabled').getAttribute('aria-checked')).toBe('false')
    expect(radio('All').getAttribute('aria-checked')).toBe('true')
    expect(radio('All').tabIndex).toBe(0)
  })

  it('uses defaultValue in uncontrolled mode', () => {
    render(<AppSelectorBar defaultValue="done" items={items} />)
    expect(radio('Done').getAttribute('aria-checked')).toBe('true')
  })

  it('only reports clicks in controlled mode', () => {
    const onChange = vi.fn()
    render(<AppSelectorBar items={items} onChange={onChange} value="all" />)

    act(() => radio('Open').click())
    expect(onChange).toHaveBeenCalledWith('open')
    expect(radio('All').getAttribute('aria-checked')).toBe('true')
    expect(radio('Open').getAttribute('aria-checked')).toBe('false')
  })

  it('updates selection after a click in uncontrolled mode', () => {
    render(<AppSelectorBar items={items} />)
    act(() => radio('Open').click())
    expect(radio('Open').getAttribute('aria-checked')).toBe('true')
  })

  it('does not report a click on the selected item', () => {
    const onChange = vi.fn()
    render(<AppSelectorBar items={items} onChange={onChange} />)
    act(() => radio('All').click())
    expect(onChange).not.toHaveBeenCalled()
  })

  it('does not allow a disabled item to be selected', () => {
    const onChange = vi.fn()
    render(
      <AppSelectorBar
        items={[items[0], { ...items[1], disabled: true }, items[2]]}
        onChange={onChange}
      />,
    )
    act(() => radio('Open').click())
    expect(onChange).not.toHaveBeenCalled()
    expect(radio('Open').disabled).toBe(true)
  })

  it('does not switch when the whole bar is disabled', () => {
    const onChange = vi.fn()
    render(<AppSelectorBar disabled items={items} onChange={onChange} />)
    act(() => radio('Open').click())
    expect(onChange).not.toHaveBeenCalled()
    expect(container.querySelector('[role="radiogroup"]')?.getAttribute('aria-disabled')).toBe('true')
    expect(radio('All').tabIndex).toBe(-1)
  })

  it('switches with left and right arrow keys and wraps at both ends', () => {
    render(<AppSelectorBar items={items} />)
    press(radio('All'), 'ArrowLeft')
    expect(radio('Done').getAttribute('aria-checked')).toBe('true')
    press(radio('Done'), 'ArrowRight')
    expect(radio('All').getAttribute('aria-checked')).toBe('true')
  })

  it('switches to the first and last item with Home and End', () => {
    render(<AppSelectorBar defaultValue="open" items={items} />)
    press(radio('Open'), 'End')
    expect(radio('Done').getAttribute('aria-checked')).toBe('true')
    press(radio('Done'), 'Home')
    expect(radio('All').getAttribute('aria-checked')).toBe('true')
  })

  it('skips disabled items during keyboard navigation', () => {
    render(
      <AppSelectorBar
        items={[items[0], { ...items[1], disabled: true }, items[2]]}
      />,
    )
    press(radio('All'), 'ArrowRight')
    expect(radio('Done').getAttribute('aria-checked')).toBe('true')
  })

  it('uses radiogroup and radio semantics with checked and disabled states', () => {
    render(
      <AppSelectorBar
        ariaLabel="Task view"
        items={[items[0], { ...items[1], disabled: true }]}
      />,
    )
    const group = container.querySelector('[role="radiogroup"]')
    expect(group?.getAttribute('aria-label')).toBe('Task view')
    expect(radio('All').getAttribute('aria-checked')).toBe('true')
    expect(radio('Open').getAttribute('aria-disabled')).toBe('true')
  })

  it('renders label-only and icon-only items', () => {
    render(
      <AppSelectorBar
        items={[
          { key: 'label', label: 'Label only' },
          { key: 'icon', icon: <span data-testid="star">★</span>, ariaLabel: 'Star' },
        ]}
      />,
    )
    expect(radio('Label only')).toBeTruthy()
    expect(container.querySelector('[data-testid="star"]')).not.toBeNull()
    expect(container.querySelector('[aria-label="Star"]')).not.toBeNull()
  })

  it('falls back when the selected item is removed', () => {
    function Harness() {
      const [currentItems, setCurrentItems] = useState(items)
      return (
        <>
          <button type="button" onClick={() => setCurrentItems(items.slice(1))}>
            Remove
          </button>
          <AppSelectorBar items={currentItems} defaultValue="all" />
        </>
      )
    }

    render(<Harness />)
    act(() => container.querySelector<HTMLButtonElement>('button')?.click())
    expect(radio('Open').getAttribute('aria-checked')).toBe('true')
  })

  it('falls back when the selected item becomes disabled', () => {
    render(<AppSelectorBar defaultValue="done" items={items} />)
    expect(radio('Done').getAttribute('aria-checked')).toBe('true')

    render(
      <AppSelectorBar
        defaultValue="done"
        items={items.map((item) =>
          item.key === 'done' ? { ...item, disabled: true } : item,
        )}
      />,
    )
    expect(radio('All').getAttribute('aria-checked')).toBe('true')
  })

  it('falls back and reports the new value when a controlled value is unavailable', () => {
    const onChange = vi.fn()
    render(<AppSelectorBar items={items.slice(1)} onChange={onChange} value="all" />)
    expect(radio('Open').getAttribute('aria-checked')).toBe('true')
    expect(onChange).toHaveBeenCalledWith('open')
  })

  it('handles an entirely disabled collection without an invalid selection', () => {
    const onChange = vi.fn()
    render(
      <AppSelectorBar
        items={items.map((item) => ({ ...item, disabled: true }))}
        onChange={onChange}
      />,
    )
    expect(container.querySelectorAll('[aria-checked="true"]')).toHaveLength(0)
    expect(container.querySelectorAll('[role="radio"][tabindex="0"]')).toHaveLength(0)
    expect(onChange).not.toHaveBeenCalled()
  })
})
