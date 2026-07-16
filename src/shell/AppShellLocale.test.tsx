// @vitest-environment jsdom

import { act } from 'react'
import { createPortal } from 'react-dom'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppDialog } from '../dialog/AppDialog'
import { useAppLocale } from '../localization/useAppLocale'
import { AppShell } from './AppShell'

function LocaleReader({ name }: { name: string }) {
  const locale = useAppLocale()
  return (
    <output data-locale-reader={name}>
      {locale.locale}:{locale.firstDayOfWeek}:{locale.hourCycle}
    </output>
  )
}

function PortalReader() {
  return createPortal(<LocaleReader name="portal" />, document.body)
}

describe('AppShell locale', () => {
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
    document
      .querySelectorAll('[data-locale-reader="portal"]')
      .forEach((node) => node.remove())
    vi.unstubAllGlobals()
  })

  const render = (node: React.ReactNode) =>
    act(() => root.render(node))
  const text = (name: string) =>
    document.querySelector(`[data-locale-reader="${name}"]`)?.textContent

  it('defaults to system locale and reacts to languagechange', () => {
    render(
      <AppShell>
        <LocaleReader name="child" />
      </AppShell>,
    )
    expect(text('child')).toBe('en-US:0:12')

    languages = ['zh-TW']
    act(() => window.dispatchEvent(new Event('languagechange')))
    expect(text('child')).toBe('zh-CN:1:24')
  })

  it('supports explicit locales and updates on rerender', () => {
    render(
      <AppShell locale="zh-CN">
        <LocaleReader name="child" />
      </AppShell>,
    )
    expect(text('child')).toBe('zh-CN:1:24')

    render(
      <AppShell locale="en-US">
        <LocaleReader name="child" />
      </AppShell>,
    )
    expect(text('child')).toBe('en-US:0:12')
  })

  it('preserves locale context through portals and dialog layers', () => {
    render(
      <AppShell locale="zh-CN">
        <PortalReader />
        <AppDialog open title="Locale dialog">
          <LocaleReader name="dialog" />
        </AppDialog>
      </AppShell>,
    )

    expect(text('portal')).toBe('zh-CN:1:24')
    expect(text('dialog')).toBe('zh-CN:1:24')
  })
})
