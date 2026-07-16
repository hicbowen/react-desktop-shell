import { describe, expect, it } from 'vitest'
import { demoPages, railFooterItems, railItems } from './demoRegistry'

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
})
