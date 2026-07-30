import { describe, expect, it } from 'vitest'
import { demoPages, getDemoPages, getRailFooterItems, getRailItems, railFooterItems, railItems } from './demoRegistry'

describe('settings demo registration', () => {
  it('keeps the unified settings page only in the rail footer', () => {
    expect(
      demoPages
        .filter((page) => page.category === 'settings')
        .map((page) => page.key),
    ).toEqual(['settings'])

    expect(
      railItems.some(
        (entry) =>
          ('key' in entry && entry.key === 'settings') ||
          (entry.type === 'group' && entry.label === 'Settings'),
      ),
    ).toBe(false)

    expect(railFooterItems).toEqual([
      expect.objectContaining({ key: 'settings', label: 'Settings' }),
    ])
  })

  it('provides localized metadata and navigation for every demo page', () => {
    const chinesePages = getDemoPages('zh-CN')

    expect(chinesePages).toHaveLength(demoPages.length)
    expect(chinesePages.every((page) => page.label && page.description)).toBe(true)
    expect(chinesePages.find((page) => page.key === 'overview')).toMatchObject({
      categoryLabel: '概览',
      label: '概览',
    })
    expect(
      getRailItems(chinesePages).some(
        (entry) => entry.type === 'group' && entry.label === '应用框架',
      ),
    ).toBe(true)
    expect(getRailFooterItems(chinesePages)).toEqual([
      expect.objectContaining({ key: 'settings', label: '设置' }),
    ])
  })

  it('organizes component pages by task and responsibility', () => {
    const inputPages = demoPages.filter((page) => page.category === 'input')
    expect(new Set(inputPages.map((page) => page.subgroup))).toEqual(
      new Set(['text', 'numeric', 'selection', 'date-time', 'specialized', 'form']),
    )
    expect(demoPages.find((page) => page.key === 'app-scroll-area')).toMatchObject({ category: 'shell', subgroup: 'layout' })
    expect(demoPages.find((page) => page.key === 'app-pagination')).toMatchObject({ category: 'navigation', subgroup: 'controls' })
    expect(demoPages.find((page) => page.key === 'tree-view')).toMatchObject({ category: 'data', subgroup: 'collections' })
    expect(demoPages.find((page) => page.key === 'app-field')).toMatchObject({ category: 'input', subgroup: 'form' })
    expect(demoPages.find((page) => page.key === 'form-layout')).toMatchObject({ category: 'input', subgroup: 'form' })
    expect(demoPages.every((page) => page.status && page.apiNames)).toBe(true)
  })

  it('renders categories as headings and responsibilities as submenus', () => {
    expect(railItems.some((entry) => entry.type === 'group' && entry.label === 'Input & selection')).toBe(true)
    expect(
      railItems.some(
        (entry) => entry.type === 'submenu' && entry.label === 'Date & time' && entry.children.some((item) => item.key === 'date-picker'),
      ),
    ).toBe(true)
    expect(
      railItems.some(
        (entry) => entry.type === 'submenu' && entry.label === 'Form structure' && entry.children.some((item) => item.key === 'app-field'),
      ),
    ).toBe(true)
  })

  it('avoids single-component responsibility groups', () => {
    const componentPages = demoPages.filter(
      (page) => page.category !== 'getting-started' && page.category !== 'settings',
    )
    const groupSizes = new Map<string, number>()

    for (const page of componentPages) {
      const key = `${page.category}/${page.subgroup}`
      groupSizes.set(key, (groupSizes.get(key) ?? 0) + 1)
    }

    expect(
      [...groupSizes.entries()].filter(([, count]) => count < 2),
    ).toEqual([])
  })

  it('keeps independently documented controls on separate pages', () => {
    const removedCombinedPages = ['field-empty-state', 'progress-status', 'selection-controls', 'text-inputs']
    expect(demoPages.some((page) => removedCombinedPages.includes(page.key))).toBe(false)
    expect(
      ['app-field', 'app-empty-state', 'app-number-box', 'app-select', 'app-progress', 'app-status-badge', 'app-check-box', 'app-radio-group', 'app-segmented-control', 'app-toggle-switch', 'app-text-box', 'app-text-area']
        .every((key) => demoPages.some((page) => page.key === key)),
    ).toBe(true)
  })

  it('only links to registered related component pages', () => {
    const keys = new Set(demoPages.map((page) => page.key))
    const missing = demoPages.flatMap((page) => (page.related ?? []).filter((key) => !keys.has(key)))
    expect(missing).toEqual([])
  })
})
