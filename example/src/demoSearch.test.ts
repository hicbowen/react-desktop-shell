import { describe, expect, it } from 'vitest'
import { demoPages, getDemoPages } from './demoRegistry'
import { searchDemoPages } from './demoSearch'

describe('demo search', () => {
  const chinesePages = getDemoPages('zh-CN')

  it.each(['日期选择器', 'Date Picker', 'AppDatePicker'])(
    'finds a component by %s',
    (query) => {
      expect(searchDemoPages(query, chinesePages, demoPages)[0]?.key).toBe('date-picker')
    },
  )

  it('matches localized categories and descriptions', () => {
    expect(searchDemoPages('模态交互', chinesePages, demoPages).map((page) => page.key)).toContain('app-dialog')
    expect(searchDemoPages('键盘', chinesePages, demoPages).some((page) => page.key === 'app-command')).toBe(true)
  })

  it('does not include overview or settings', () => {
    expect(searchDemoPages('设置', chinesePages, demoPages).some((page) => page.key === 'settings')).toBe(false)
  })
})
