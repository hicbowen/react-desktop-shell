// @vitest-environment jsdom

import { act, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppCard } from './AppCard'
import { AppCardFooter } from './AppCardFooter'

describe('AppCardFooter', () => {
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
  const footer = () => container.querySelector<HTMLElement>('.app-card-footer')!

  it('uses children as complete custom content when no regions exist', () => {
    render(<AppCardFooter>Custom footer</AppCardFooter>)
    expect(footer().textContent).toBe('Custom footer')
    expect(footer().classList).not.toContain('app-card-footer--regions')
  })

  it('renders start and end regions with children in the middle', () => {
    render(
      <AppCardFooter start="Updated" end={<button>Update</button>}>
        Middle
      </AppCardFooter>,
    )
    expect(container.querySelector('.app-card-footer__start')?.textContent).toBe('Updated')
    expect(container.querySelector('.app-card-footer__content')?.textContent).toBe('Middle')
    expect(container.querySelector('.app-card-footer__end')?.textContent).toBe('Update')
  })

  it('keeps divided off by default and maps it when enabled', () => {
    render(<AppCardFooter>Footer</AppCardFooter>)
    expect(footer().dataset.divided).toBeUndefined()
    expect(footer().classList).not.toContain('app-card-footer--divided')

    render(<AppCardFooter divided>Footer</AppCardFooter>)
    expect(footer().dataset.divided).toBe('true')
    expect(footer().classList).toContain('app-card-footer--divided')
  })

  it('allows a Footer button without activating its parent Card', () => {
    const onButtonClick = vi.fn()
    const onCardClick = vi.fn()
    render(
      <AppCard onClick={onCardClick}>
        <AppCardFooter end={<button onClick={onButtonClick}>Update</button>} />
      </AppCard>,
    )
    act(() => container.querySelector('button')?.click())
    expect(onButtonClick).toHaveBeenCalledTimes(1)
    expect(onCardClick).not.toHaveBeenCalled()
  })

  it('forwards className and HTML attributes', () => {
    render(
      <AppCardFooter
        aria-label="Metadata"
        className="custom-footer"
        data-testid="footer"
      />,
    )
    expect(footer().classList).toContain('custom-footer')
    expect(footer().getAttribute('aria-label')).toBe('Metadata')
    expect(footer().dataset.testid).toBe('footer')
  })

  it('renders safely without content', () => {
    render(<AppCardFooter />)
    expect(footer()).toBeTruthy()
  })
})
