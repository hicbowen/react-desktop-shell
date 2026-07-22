import { describe, expect, it } from 'vitest'
import { demoPages, getDemoPages, getRailFooterItems, getRailItems, railFooterItems, railItems } from './demoRegistry'

describe('settings demo registration', () => {
  it('keeps the unified settings page only in the rail footer', () => {
    expect(
      demoPages
        .filter((page) => page.group === 'Settings')
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
      group: '概览',
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
      new Set(['text', 'numeric', 'selection', 'date-time', 'specialized']),
    )
    expect(demoPages.find((page) => page.key === 'app-scroll-area')).toMatchObject({ category: 'shell', subgroup: 'layout' })
    expect(demoPages.find((page) => page.key === 'app-pagination')).toMatchObject({ category: 'navigation', subgroup: 'collection' })
    expect(demoPages.find((page) => page.key === 'tree-view')).toMatchObject({ category: 'data', subgroup: 'collections' })
    expect(demoPages.every((page) => page.status && page.apiNames)).toBe(true)
  })

  it('renders categories as headings and responsibilities as submenus', () => {
    expect(railItems.some((entry) => entry.type === 'group' && entry.label === 'Input & selection')).toBe(true)
    expect(
      railItems.some(
        (entry) => entry.type === 'submenu' && entry.label === 'Date & time' && entry.children.some((item) => item.key === 'date-picker'),
      ),
    ).toBe(true)
  })
})
