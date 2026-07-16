// @vitest-environment jsdom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAppLocale } from './useAppLocale'

function LocaleReader() {
  const locale = useAppLocale()
  return (
    <output>
      {locale.locale}:{locale.firstDayOfWeek}:{locale.hourCycle}
    </output>
  )
}

describe('useAppLocale', () => {
  let container: HTMLDivElement
  let root: Root
  let languages: string[]

  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
      .IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)
    languages = ['en-US']
    vi.stubGlobal('navigator', {
      get language() {
        return languages[0] ?? ''
      },
      get languages() {
        return languages
      },
    })
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
    vi.unstubAllGlobals()
  })

  it('uses system settings outside AppShell and reacts to languagechange', () => {
    act(() => root.render(<LocaleReader />))
    expect(container.textContent).toBe('en-US:0:12')

    languages = ['zh-HK']
    act(() => window.dispatchEvent(new Event('languagechange')))
    expect(container.textContent).toBe('zh-CN:1:24')
  })
})
