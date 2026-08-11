// @vitest-environment jsdom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppCarousel } from './AppCarousel'
import type { AppCarouselSlide } from './types'

const slides: AppCarouselSlide[] = [
  { key: 'one', eyebrow: 'First', title: 'First slide', description: 'First description' },
  { key: 'two', eyebrow: 'Second', title: 'Second slide', description: 'Second description' },
  { key: 'three', eyebrow: 'Third', title: 'Third slide', description: 'Third description' },
]

describe('AppCarousel', () => {
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

  const render = (
    props: Partial<React.ComponentProps<typeof AppCarousel>> = {},
  ) => {
    act(() => root.render(<AppCarousel slides={slides} {...props} />))
  }

  const button = (label: string) =>
    container.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)

  it('renders a banner and localized position', () => {
    render()

    expect(container.textContent).toContain('First slide')
    expect(container.textContent).toContain('First description')
    expect(container.textContent).toContain('Slide 1 of 3')
    expect(button('Previous item')?.disabled).toBe(true)
    expect(button('Next item')?.disabled).toBe(false)
    expect(container.querySelector('.app-carousel__dot--active')).toBeTruthy()
  })

  it('moves with navigation buttons and reports the selected key', () => {
    const onValueChange = vi.fn()
    render({ onValueChange })

    act(() => button('Next item')?.click())

    expect(onValueChange).toHaveBeenCalledWith('two')
    expect(container.textContent).toContain('Second slide')
    expect(container.textContent).toContain('Slide 2 of 3')
  })

  it('moves when an indicator is selected', () => {
    render()

    act(() =>
      container
        .querySelectorAll<HTMLButtonElement>('.app-carousel__dot')[2]
        ?.click(),
    )

    expect(container.textContent).toContain('Third slide')
    expect(
      container.querySelector('.app-carousel__dot--active')?.getAttribute('aria-label'),
    ).toBe('Slide 3 of 3')
  })

  it('supports keyboard navigation without looping', () => {
    render({ defaultValue: 'two' })
    const carousel = container.querySelector<HTMLElement>('.app-carousel')!

    act(() => {
      carousel.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    })
    expect(container.textContent).toContain('Third slide')

    act(() => {
      carousel.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    })
    expect(container.textContent).toContain('Third slide')
  })

  it('keeps a controlled value under host control', () => {
    const onValueChange = vi.fn()
    render({ onValueChange, value: 'one' })

    act(() => button('Next item')?.click())

    expect(onValueChange).toHaveBeenCalledWith('two')
    expect(container.textContent).toContain('First slide')
  })

  it('renders nothing when there are no slides', () => {
    render({ slides: [] })
    expect(container.querySelector('.app-carousel')).toBeNull()
  })
})
