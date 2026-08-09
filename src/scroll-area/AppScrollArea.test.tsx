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
  const viewport = () =>
    container.querySelector<HTMLDivElement>('.app-scroll-area__viewport')!

  const setDimension = (
    element: HTMLElement,
    property: 'clientHeight' | 'clientWidth' | 'scrollHeight' | 'scrollWidth',
    value: number,
  ) => {
    Object.defineProperty(element, property, {
      configurable: true,
      value,
    })
  }

  const setVerticalMetrics = async ({
    clientHeight = 100,
    scrollHeight = 400,
    trackHeight = 160,
  } = {}) => {
    setDimension(viewport(), 'clientHeight', clientHeight)
    setDimension(viewport(), 'scrollHeight', scrollHeight)
    const track = container.querySelector<HTMLDivElement>(
      '.app-scroll-area__scrollbar--vertical .app-scroll-area__track',
    )!
    setDimension(track, 'clientHeight', trackHeight)
    await act(async () => {
      window.dispatchEvent(new Event('resize'))
      await new Promise((resolve) => setTimeout(resolve, 20))
    })
    return track
  }

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
    expect(viewport().getAttribute('aria-label')).toBe('Student list')
    expect(viewport().dataset.testid).toBe('student-scroll')
  })

  it('forwards onScroll', () => {
    const onScroll = vi.fn()
    render(<AppScrollArea onScroll={onScroll} />)
    act(() =>
      viewport().dispatchEvent(new Event('scroll', { bubbles: false })),
    )
    expect(onScroll).toHaveBeenCalledTimes(1)
  })

  it('forwards its ref to the native scrolling viewport', () => {
    const ref = createRef<HTMLDivElement>()
    render(<AppScrollArea ref={ref} />)
    expect(ref.current).toBe(viewport())
  })

  it('does not add tabIndex or role by default', () => {
    render(<AppScrollArea />)
    expect(viewport().getAttribute('tabindex')).toBeNull()
    expect(viewport().getAttribute('role')).toBeNull()
  })

  it('forwards an explicit tabIndex and role', () => {
    render(
      <AppScrollArea aria-label="Release notes" role="region" tabIndex={0} />,
    )
    expect(viewport().tabIndex).toBe(0)
    expect(viewport().getAttribute('role')).toBe('region')
  })

  it('keeps custom scrollbars out of the accessibility tree', () => {
    render(<AppScrollArea orientation="both" />)
    const scrollbars = container.querySelectorAll(
      '.app-scroll-area__scrollbar',
    )
    expect(scrollbars).toHaveLength(2)
    for (const scrollbar of scrollbars) {
      expect(scrollbar.getAttribute('aria-hidden')).toBe('true')
      expect(scrollbar.querySelector('[tabindex]')).toBeNull()
      expect(scrollbar.querySelector('button')).toBeNull()
    }
  })

  it('does not render custom scrollbar controls in hidden mode', () => {
    render(<AppScrollArea orientation="both" scrollbar="hidden" />)
    expect(
      container.querySelector('.app-scroll-area__scrollbar'),
    ).toBeNull()
  })

  it('measures overflow and maps the thumb proportionally', async () => {
    render(<AppScrollArea />)
    await setVerticalMetrics()

    const scrollbar = container.querySelector<HTMLDivElement>(
      '.app-scroll-area__scrollbar--vertical',
    )!
    const thumb = scrollbar.querySelector<HTMLDivElement>(
      '.app-scroll-area__thumb',
    )!
    expect(area().dataset.overflowY).toBe('true')
    expect(scrollbar.dataset.visible).toBe('true')
    expect(scrollbar.dataset.disabled).toBe('false')
    expect(thumb.style.getPropertyValue('--app-scrollbar-thumb-length')).toBe(
      '40px',
    )
  })

  it('keeps always-mode chrome visible without overflow', () => {
    render(<AppScrollArea scrollbar="always" />)
    const scrollbar = container.querySelector<HTMLDivElement>(
      '.app-scroll-area__scrollbar--vertical',
    )!
    expect(scrollbar.dataset.visible).toBe('true')
    expect(scrollbar.dataset.disabled).toBe('true')
  })

  it('pages the native viewport when the custom track is pressed', async () => {
    render(<AppScrollArea />)
    const track = await setVerticalMetrics()
    Object.defineProperty(viewport(), 'scrollTop', {
      configurable: true,
      value: 0,
      writable: true,
    })

    act(() => {
      track.dispatchEvent(
        new MouseEvent('pointerdown', { button: 0, clientY: 120, bubbles: true }),
      )
    })
    expect(viewport().scrollTop).toBe(85)
  })

  it('scrolls one line when an arrow is pressed', async () => {
    render(<AppScrollArea />)
    await setVerticalMetrics()
    Object.defineProperty(viewport(), 'scrollTop', {
      configurable: true,
      value: 0,
      writable: true,
    })
    const incrementArrow = container.querySelector<HTMLDivElement>(
      '.app-scroll-area__scrollbar--vertical .app-scroll-area__arrow--increment',
    )!

    act(() => {
      incrementArrow.dispatchEvent(
        new MouseEvent('pointerdown', { button: 0, bubbles: true }),
      )
      incrementArrow.dispatchEvent(
        new MouseEvent('pointerup', { button: 0, bubbles: true }),
      )
    })
    expect(viewport().scrollTop).toBe(16)
  })

  it('maps thumb dragging back to the native scroll offset', async () => {
    render(<AppScrollArea />)
    await setVerticalMetrics()
    Object.defineProperty(viewport(), 'scrollTop', {
      configurable: true,
      value: 0,
      writable: true,
    })
    const thumb = container.querySelector<HTMLDivElement>(
      '.app-scroll-area__scrollbar--vertical .app-scroll-area__thumb',
    )!
    setDimension(thumb, 'clientHeight', 40)

    act(() => {
      thumb.dispatchEvent(
        new MouseEvent('pointerdown', { button: 0, clientY: 20, bubbles: true }),
      )
      thumb.dispatchEvent(
        new MouseEvent('pointermove', { button: 0, clientY: 80, bubbles: true }),
      )
      thumb.dispatchEvent(
        new MouseEvent('pointerup', { button: 0, clientY: 80, bubbles: true }),
      )
    })
    expect(viewport().scrollTop).toBe(150)
  })
})
