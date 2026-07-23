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

  it('returns the original TSX module and display path', () => {
    const result = getDemoSource('app-compact-group')

    expect(result?.path).toBe(
      'example/src/pages/forms/AppCompactGroupPage.tsx',
    )
    expect(result?.source).toContain(
      'export function AppCompactGroupPage()',
    )
  })
})
