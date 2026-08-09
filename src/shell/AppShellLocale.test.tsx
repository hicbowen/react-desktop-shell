// @vitest-environment jsdom

import { act } from 'react'
import { createPortal } from 'react-dom'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppDialog } from '../dialog/AppDialog'
import { useAppLocale } from '../localization/useAppLocale'
import { AppRail } from '../navigation/AppRail'
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

  it('uses AppScrollArea for shell content and preserves content styling', () => {
    render(
      <AppShell
        contentClassName="custom-shell-content"
        contentStyle={{ paddingTop: 14 }}
      >
        Shell content
      </AppShell>,
    )

    const scrollArea = container.querySelector<HTMLElement>(
      '.app-shell__content',
    )
    const viewport = scrollArea?.querySelector<HTMLElement>(
      ':scope > .app-scroll-area__viewport',
    )
    expect(scrollArea?.classList).toContain('app-scroll-area')
    expect(scrollArea?.dataset.orientation).toBe('both')
    expect(viewport?.classList).toContain('custom-shell-content')
    expect(viewport?.style.paddingTop).toBe('14px')
  })

  it('reserves compact rail width without shrinking compact items', () => {
    render(<AppShell sidebar={{ displayMode: 'compact' }} />)

    const shell = container.querySelector<HTMLElement>('.app-shell')
    expect(shell?.style.getPropertyValue('--app-sidebar-compact-width')).toBe(
      '62px',
    )
  })

  it('keeps the pane toggle and app identity in the title bar across modes', () => {
    render(
      <AppShell
        icon={<span data-app-icon />}
        rail={<nav>Navigation</nav>}
        sidebar={{ defaultDisplayMode: 'expanded' }}
        title="Desktop app"
      />,
    )

    const shell = container.querySelector<HTMLElement>('.app-shell')
    const titleBar = container.querySelector<HTMLElement>(
      '.app-shell__titlebar',
    )
    const toggle = titleBar?.querySelector<HTMLButtonElement>(
      '.app-shell__pane-toggle',
    )

    expect(titleBar?.querySelector('.app-shell__titlebar-title')?.textContent)
      .toBe('Desktop app')
    expect(titleBar?.querySelector('[data-app-icon]')).not.toBeNull()
    expect(toggle?.getAttribute('aria-expanded')).toBe('true')
    expect(shell?.dataset.paneMode).toBe('expanded')

    act(() => toggle?.click())

    expect(shell?.dataset.paneMode).toBe('compact')
    expect(titleBar?.querySelector('.app-shell__titlebar-title')?.textContent)
      .toBe('Desktop app')
    expect(toggle?.getAttribute('aria-expanded')).toBe('false')
  })

  it('keeps the title bar visible while the minimal pane is open', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })))
    render(
      <AppShell
        rail={
          <AppRail
            items={[{ key: 'home', label: 'Home' }]}
            value="home"
          />
        }
        sidebar={{ displayMode: 'minimal' }}
        title="Desktop app"
      />,
    )

    const titleBar = container.querySelector<HTMLElement>(
      '.app-shell__titlebar',
    )
    const toggle = titleBar?.querySelector<HTMLButtonElement>(
      '.app-shell__pane-toggle',
    )

    act(() => toggle?.click())

    expect(toggle?.getAttribute('aria-expanded')).toBe('true')
    expect(container.querySelector('.app-shell__pane-overlay')).not.toBeNull()
    expect(titleBar?.querySelector('.app-shell__titlebar-title')?.textContent)
      .toBe('Desktop app')
    expect(container.querySelectorAll('.app-shell__pane-toggle')).toHaveLength(1)
    expect(
      container.querySelector('.app-shell__body')?.hasAttribute('inert'),
    ).toBe(true)
    expect(document.activeElement?.getAttribute('aria-current')).toBe('page')

    act(() => toggle?.click())

    expect(container.querySelector('.app-shell__pane-overlay')).toBeNull()
    expect(
      container.querySelector('.app-shell__body')?.hasAttribute('inert'),
    ).toBe(false)
    expect(document.activeElement).toBe(toggle)
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
