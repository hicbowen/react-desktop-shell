// @vitest-environment jsdom

import { act, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppCard } from './AppCard'
import { AppCardFooter } from './AppCardFooter'
import { AppCardHeader } from './AppCardHeader'

describe('AppCard', () => {
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

  const render = (node: ReactNode) => act(() => root.render(node))
  const card = () => container.querySelector<HTMLElement>('.app-card')!
  const keyDown = (key: string) => {
    const event = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key,
    })
    act(() => card().dispatchEvent(event))
    return event
  }

  it('renders a static div without button semantics or automatic tabIndex', () => {
    render(<AppCard>Content</AppCard>)
    expect(card().tagName).toBe('DIV')
    expect(card().textContent).toContain('Content')
    expect(card().getAttribute('role')).toBeNull()
    expect(card().getAttribute('tabindex')).toBeNull()
  })

  it('renders without children', () => {
    render(<AppCard />)
    expect(card()).toBeTruthy()
  })

  it('becomes clickable and focusable when onClick is provided', () => {
    const onClick = vi.fn()
    render(<AppCard onClick={onClick}>Open</AppCard>)
    act(() => card().click())
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(card().getAttribute('role')).toBe('button')
    expect(card().tabIndex).toBe(0)
  })

  it('can explicitly suppress automatic interactive semantics', () => {
    const onClick = vi.fn()
    render(
      <AppCard interactive={false} onClick={onClick}>
        Open
      </AppCard>,
    )
    expect(card().getAttribute('role')).toBeNull()
    expect(card().getAttribute('tabindex')).toBeNull()
    act(() => card().click())
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('activates with Enter', () => {
    const onClick = vi.fn()
    render(<AppCard onClick={onClick}>Open</AppCard>)
    keyDown('Enter')
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('activates with Space and prevents its default scrolling behavior', () => {
    const onClick = vi.fn()
    render(<AppCard onClick={onClick}>Open</AppCard>)
    const event = keyDown(' ')
    expect(event.defaultPrevented).toBe(true)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does not activate from repeated keyboard events', () => {
    const onClick = vi.fn()
    render(<AppCard onClick={onClick}>Open</AppCard>)
    act(() =>
      card().dispatchEvent(
        new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          key: 'Enter',
          repeat: true,
        }),
      ),
    )
    expect(onClick).not.toHaveBeenCalled()
  })

  it('blocks mouse and keyboard activation while disabled', () => {
    const onClick = vi.fn()
    render(
      <AppCard disabled onClick={onClick}>
        Open
      </AppCard>,
    )
    act(() => card().click())
    keyDown('Enter')
    keyDown(' ')
    expect(onClick).not.toHaveBeenCalled()
    expect(card().getAttribute('aria-disabled')).toBe('true')
    expect(card().tabIndex).toBe(-1)
  })

  it.each([
    ['button', <button type="button">Button</button>],
    ['link', <a href="#target">Link</a>],
    ['input', <input aria-label="Value" />],
  ])('does not activate from an internal %s', (_, control) => {
    const onClick = vi.fn()
    render(<AppCard onClick={onClick}>{control}</AppCard>)
    act(() => container.querySelector<HTMLElement>('.app-card > *')?.click())
    expect(onClick).not.toHaveBeenCalled()
  })

  it('does not activate from Header or Footer actions', () => {
    const onCardClick = vi.fn()
    const onHeaderClick = vi.fn()
    const onFooterClick = vi.fn()
    render(
      <AppCard onClick={onCardClick}>
        <AppCardHeader
          action={<button onClick={onHeaderClick}>Header action</button>}
          title="Title"
        />
        <AppCardFooter end={<button onClick={onFooterClick}>Footer action</button>} />
      </AppCard>,
    )

    const buttons = container.querySelectorAll<HTMLButtonElement>('button')
    act(() => buttons[0]?.click())
    act(() => buttons[1]?.click())
    expect(onHeaderClick).toHaveBeenCalledTimes(1)
    expect(onFooterClick).toHaveBeenCalledTimes(1)
    expect(onCardClick).not.toHaveBeenCalled()
  })

  it('does not turn a static selected card into a button', () => {
    render(<AppCard selected>Selected</AppCard>)
    expect(card().dataset.selected).toBe('true')
    expect(card().getAttribute('aria-pressed')).toBeNull()
    expect(card().getAttribute('role')).toBeNull()
  })

  it('maps selected to aria-pressed for interactive cards', () => {
    render(<AppCard interactive selected>Selected</AppCard>)
    expect(card().getAttribute('aria-pressed')).toBe('true')
  })

  it('maps appearance, orientation, and padding states', () => {
    render(
      <AppCard appearance="outlined" orientation="horizontal" padding="compact" />,
    )
    expect(card().dataset.appearance).toBe('outlined')
    expect(card().dataset.orientation).toBe('horizontal')
    expect(card().dataset.padding).toBe('compact')
    expect(card().classList).toContain('app-card--outlined')
    expect(card().classList).toContain('app-card--horizontal')
    expect(card().classList).toContain('app-card--padding-compact')
  })

  it('forwards className, style, and HTML attributes', () => {
    render(
      <AppCard
        aria-label="Summary"
        className="custom-card"
        data-testid="summary"
        style={{ width: 320 }}
      />,
    )
    expect(card().classList).toContain('custom-card')
    expect(card().getAttribute('aria-label')).toBe('Summary')
    expect(card().dataset.testid).toBe('summary')
    expect(card().style.width).toBe('320px')
  })
})
