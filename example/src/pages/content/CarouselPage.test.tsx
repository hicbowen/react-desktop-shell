// @vitest-environment jsdom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AppCarouselPage } from './CarouselPage'

describe('AppCarouselPage', () => {
  let host: HTMLDivElement
  let root: Root

  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
      .IS_REACT_ACT_ENVIRONMENT = true
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
  })

  afterEach(() => {
    act(() => root.unmount())
    host.remove()
  })

  const carousel = (label: string) =>
    host.querySelector<HTMLElement>(`.app-carousel[aria-label="${label}"]`)!

  it('renders four visually distinct carousel applications', () => {
    act(() => root.render(<AppCarouselPage />))

    const banner = carousel('Promotional banner')
    const gallery = carousel('Travel photo gallery')
    const walkthrough = carousel('Workspace feature walkthrough')
    const announcements = carousel('Product announcements')

    expect(host.querySelectorAll('.demo-section')).toHaveLength(4)
    expect(banner.classList.contains('app-carousel--split')).toBe(true)
    expect(banner.querySelector('.app-carousel__slide--with-visual')).not.toBeNull()
    expect(gallery.classList.contains('app-carousel--media')).toBe(true)
    expect(gallery.querySelector('.app-carousel__slide--media img')).not.toBeNull()
    expect(
      gallery.querySelector('[role="img"]')?.getAttribute('aria-label'),
    ).toBe('An alpine lake and cabin at blue hour')
    expect(walkthrough.classList.contains('app-carousel--stacked')).toBe(true)
    expect(walkthrough.querySelector('.app-carousel__slide--stacked')).not.toBeNull()
    expect(announcements.querySelector('.app-carousel__slide--text-only')).not.toBeNull()
  })

  it('moves between full-bleed gallery images', () => {
    act(() => root.render(<AppCarouselPage />))

    const gallery = carousel('Travel photo gallery')
    act(() =>
      gallery
        .querySelector<HTMLButtonElement>('button[aria-label="Next item"]')
        ?.click(),
    )

    expect(
      gallery.querySelector('.app-carousel__slide')?.getAttribute('data-key'),
    ).toBe('coastal-cliffs')
    expect(gallery.textContent).toContain('Cliffs above the quiet cove')
  })
})
