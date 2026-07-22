import { describe, expect, it } from 'vitest'
import { getDemoHash, getDemoKeyFromHash } from './demoNavigation'

const keys = new Set(['overview', 'settings', 'app-date-picker'])

describe('demo navigation', () => {
  it('creates canonical hashes', () => {
    expect(getDemoHash('overview')).toBe('#/')
    expect(getDemoHash('settings')).toBe('#/settings')
    expect(getDemoHash('app-date-picker')).toBe('#/components/app-date-picker')
  })

  it('resolves valid hashes and falls back for unknown pages', () => {
    expect(getDemoKeyFromHash('#/components/app-date-picker', keys)).toBe('app-date-picker')
    expect(getDemoKeyFromHash('#/settings', keys)).toBe('settings')
    expect(getDemoKeyFromHash('#/components/missing', keys)).toBe('overview')
  })
})
