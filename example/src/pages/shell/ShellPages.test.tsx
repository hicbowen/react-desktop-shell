// @vitest-environment jsdom
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DemoShellContext } from '../../components/DemoShellContext'
import { DemoI18nContext, demoMessages } from '../../i18n/DemoI18nContext'
import { DemoSourceContext } from '../../components/DemoSourceContext'
import { AppShellPage } from './ShellPages'

describe('AppShellPage demo', () => {
  let host: HTMLDivElement
  let root: ReturnType<typeof createRoot>

  beforeEach(() => {
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
  })

  afterEach(() => {
    act(() => root.unmount())
    host.remove()
  })

  it('keeps the diagram, hides its source, and renders a real AppShell example', () => {
    act(() => root.render(
      <DemoI18nContext.Provider
        value={{ locale: 'en-US', messages: demoMessages['en-US'] }}
      >
        <DemoShellContext.Provider
          value={{
            locale: 'en-US',
            railDisplayMode: 'expanded',
            setLocale: () => undefined,
            setRailDisplayMode: () => undefined,
            setTheme: () => undefined,
            theme: 'light',
          }}
        >
          <DemoSourceContext.Provider
            value={{
              path: 'example/src/pages/shell/ShellPages.tsx',
              sections: [
                {
                  source: '<div className="demo-shell-diagram" />',
                  highlightedHtml: '<pre class="shiki"><code>diagram</code></pre>',
                },
                {
                  source: '<AppShell />',
                  highlightedHtml: '<pre class="shiki"><code>&lt;AppShell /&gt;</code></pre>',
                },
              ],
            }}
          >
            <AppShellPage />
          </DemoSourceContext.Provider>
        </DemoShellContext.Provider>
      </DemoI18nContext.Provider>,
    ))

    const sections = host.querySelectorAll('.demo-section')
    expect(host.querySelector('.demo-shell-diagram')).not.toBeNull()
    expect(host.querySelector('.demo-shell-live-preview .app-shell')).not.toBeNull()
    expect(sections).toHaveLength(2)
    expect(sections[0]?.querySelector('.demo-source-panel')).toBeNull()
    expect(sections[1]?.querySelector('.demo-source-panel')).not.toBeNull()

    const filesItem = Array.from(host.querySelectorAll('.app-rail button')).find(
      (button) => button.textContent?.includes('Files'),
    )
    act(() => filesItem?.click())
    expect(host.querySelector('.app-page__title')?.textContent).toBe('Files')

    const actionButton = Array.from(host.querySelectorAll('button')).find(
      (button) => button.textContent === 'Run action',
    )
    act(() => actionButton?.click())
    expect(host.textContent).toContain('Page action completed')
  })
})
