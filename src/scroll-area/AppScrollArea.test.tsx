// @vitest-environment jsdom

import { act, createRef, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppScrollArea } from './AppScrollArea'

describe('AppScrollArea', () => {
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
  const area = () =>
    container.querySelector<HTMLDivElement>('.app-scroll-area')!

  it('renders a div with the default states', () => {
    render(<AppScrollArea />)
    expect(area().tagName).toBe('DIV')
    expect(area().dataset.orientation).toBe('vertical')
    expect(area().dataset.scrollbar).toBe('auto')
    expect(area().dataset.gutter).toBe('auto')
  })

  it.each(['vertical', 'horizontal', 'both'] as const)(
    'maps %s orientation to data and class states',
    (orientation) => {
      render(<AppScrollArea orientation={orientation} />)
      expect(area().dataset.orientation).toBe(orientation)
      expect(area().classList).toContain(`app-scroll-area--${orientation}`)
    },
  )

  it.each(['auto', 'always', 'hidden'] as const)(
    'maps %s scrollbar mode to data and class states',
    (scrollbar) => {
      render(<AppScrollArea scrollbar={scrollbar} />)
      expect(area().dataset.scrollbar).toBe(scrollbar)
      expect(area().classList).toContain(
        `app-scroll-area--scrollbar-${scrollbar}`,
      )
    },
  )

  it('maps stable gutter to data and class states', () => {
    render(<AppScrollArea gutter="stable" />)
    expect(area().dataset.gutter).toBe('stable')
    expect(area().classList).toContain('app-scroll-area--gutter-stable')
  })

  it('renders children and safely supports empty children', () => {
    render(<AppScrollArea><span>Scrollable content</span></AppScrollArea>)
    expect(area().textContent).toBe('Scrollable content')
    render(<AppScrollArea />)
    expect(area()).toBeTruthy()
  })

  it('merges className and forwards style', () => {
    render(
      <AppScrollArea className="custom-area" style={{ height: 240 }} />,
    )
    expect(area().classList).toContain('app-scroll-area')
    expect(area().classList).toContain('custom-area')
    expect(area().style.height).toBe('240px')
  })

  it('forwards aria and custom data attributes', () => {
    render(
      <AppScrollArea
        aria-label="Student list"
        data-testid="student-scroll"
      />,
    )
    expect(area().getAttribute('aria-label')).toBe('Student list')
    expect(area().dataset.testid).toBe('student-scroll')
  })

  it('forwards onScroll', () => {
    const onScroll = vi.fn()
    render(<AppScrollArea onScroll={onScroll} />)
    act(() => area().dispatchEvent(new Event('scroll', { bubbles: false })))
    expect(onScroll).toHaveBeenCalledTimes(1)
  })

  it('forwards its root ref', () => {
    const ref = createRef<HTMLDivElement>()
    render(<AppScrollArea ref={ref} />)
    expect(ref.current).toBe(area())
  })

  it('does not add tabIndex or role by default', () => {
    render(<AppScrollArea />)
    expect(area().getAttribute('tabindex')).toBeNull()
    expect(area().getAttribute('role')).toBeNull()
  })

  it('forwards an explicit tabIndex and role', () => {
    render(
      <AppScrollArea aria-label="Release notes" role="region" tabIndex={0} />,
    )
    expect(area().tabIndex).toBe(0)
    expect(area().getAttribute('role')).toBe('region')
  })
})
