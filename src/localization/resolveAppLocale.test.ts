import { describe, expect, it, vi } from 'vitest'
import { resolveAppLocale } from './resolveAppLocale'

describe('resolveAppLocale', () => {
  it.each([
    ['zh-CN', 'zh-CN'],
    ['zh-TW', 'zh-CN'],
    ['zh-HK', 'zh-CN'],
    ['zh-Hans', 'zh-CN'],
    ['zh', 'zh-CN'],
    ['en-US', 'en-US'],
    ['ja-JP', 'en-US'],
  ] as const)('maps system language %s to %s', (language, expected) => {
    expect(resolveAppLocale('system', [language])).toBe(expected)
  })

  it('honors explicit locales and falls back to English', () => {
    expect(resolveAppLocale('zh-CN', ['en-US'])).toBe('zh-CN')
    expect(resolveAppLocale('en-US', ['zh-CN'])).toBe('en-US')
    expect(resolveAppLocale('system', [])).toBe('en-US')
  })

  it('is safe without navigator', () => {
    vi.stubGlobal('navigator', undefined)
    expect(resolveAppLocale('system')).toBe('en-US')
    vi.unstubAllGlobals()
  })
})
