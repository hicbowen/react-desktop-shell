import { describe, expect, it } from 'vitest'
import { demoPages } from '../demoRegistry'
import { zhCNRegistry } from './registry.zh-CN'

describe('example registry translations', () => {
  it('has a Chinese label and description for every example page', () => {
    const missing = demoPages
      .map((page) => page.key)
      .filter((key) => !zhCNRegistry[key]?.label || !zhCNRegistry[key]?.description)

    expect(missing).toEqual([])
  })
})
