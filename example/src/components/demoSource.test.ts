import { describe, expect, it } from 'vitest'
import { demoPages } from '../demoRegistry'
import { getDemoSource } from './demoSource'

describe('demo source registry', () => {
  it('resolves source for every component page', () => {
    const componentPages = demoPages.filter(
      (page) =>
        page.category !== 'getting-started' &&
        page.category !== 'settings',
    )
    const missing = componentPages
      .filter((page) => !getDemoSource(page.key))
      .map((page) => page.key)

    expect(missing).toEqual([])
  })

  it('returns section-level JSX and the original display path', () => {
    const result = getDemoSource('app-compact-group')

    expect(result?.path).toBe(
      'example/src/pages/forms/AppCompactGroupPage.tsx',
    )
    expect(result?.sections.length).toBeGreaterThan(0)
    expect(result?.sections[0]?.source).toContain('<AppCompactGroup')
    expect(result?.sections[0]?.source).not.toContain('<DemoSection')
    expect(result?.sections[0]?.source).not.toMatch(/^;/)
    expect(result?.sections[0]?.highlightedHtml).toContain(
      'class="shiki shiki-themes light-plus dark-plus"',
    )
  })

  it('includes local data declarations referenced by a section', () => {
    const result = getDemoSource('app-carousel')

    expect(result?.sections).toHaveLength(4)
    expect(result?.sections[0]?.source).toContain(
      'const bannerSlides: AppCarouselSlide[]',
    )
    expect(result?.sections[0]?.source).toContain('slides={bannerSlides}')
    expect(result?.sections[0]?.source).not.toContain('const gallerySlides')
    expect(result?.sections[1]?.source).toContain(
      'const gallerySlides: AppCarouselSlide[]',
    )
    expect(result?.sections[2]?.source).toContain(
      'const walkthroughSlides: AppCarouselSlide[]',
    )
    expect(result?.sections[3]?.source).toContain(
      'const announcementSlides: AppCarouselSlide[]',
    )
  })
})
