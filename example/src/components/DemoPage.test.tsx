// @vitest-environment jsdom
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DemoI18nContext, demoMessages } from '../i18n/DemoI18nContext'
import { DemoPage, DemoSection } from './DemoPage'
import { DemoSourceContext } from './DemoSourceContext'

function ExampleOptions({
  ariaLabel,
  options,
}: {
  ariaLabel: string
  options: { label: string; value: string }[]
}) {
  return (
    <div aria-label={ariaLabel}>
      {options.map((option) => (
        <span data-value={option.value} key={option.value}>{option.label}</span>
      ))}
    </div>
  )
}

describe('DemoPage localization', () => {
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

  it('localizes text nodes and display props without changing semantic values', () => {
    act(() => root.render(
      <DemoI18nContext.Provider
        value={{ locale: 'zh-CN', messages: demoMessages['zh-CN'] }}
      >
        <DemoPage>
          <span>Last result: <strong>No action yet</strong></span>
          <ExampleOptions
            ariaLabel="Layout"
            options={[{ label: 'Design', value: 'design' }]}
          />
        </DemoPage>
      </DemoI18nContext.Provider>,
    ))

    expect(host.textContent).toContain('上次结果： 尚未执行操作')
    expect(host.querySelector('[aria-label]')?.getAttribute('aria-label')).toBe('布局')
    expect(host.querySelector('[data-value]')?.textContent).toBe('设计')
    expect(host.querySelector('[data-value]')?.getAttribute('data-value')).toBe('design')
  })

  it('attaches each extracted source to its matching demo section', () => {
    act(() => root.render(
      <DemoI18nContext.Provider
        value={{ locale: 'en-US', messages: demoMessages['en-US'] }}
      >
        <DemoSourceContext.Provider
          value={{
            path: 'example/src/pages/ExamplePage.tsx',
            sections: [
              {
                source: '<AppButton />',
                highlightedHtml:
                  '<pre class="shiki"><code>&lt;AppButton /&gt;</code></pre>',
              },
              {
                source: '<AppLink href="#docs" />',
                highlightedHtml:
                  '<pre class="shiki"><code>&lt;AppLink href="#docs" /&gt;</code></pre>',
              },
            ],
          }}
        >
          <DemoPage>
            <DemoSection title="Button example"><button>Preview</button></DemoSection>
            <DemoSection title="Link example"><a href="#docs">Preview</a></DemoSection>
          </DemoPage>
        </DemoSourceContext.Provider>
      </DemoI18nContext.Provider>,
    ))

    const sections = host.querySelectorAll('.demo-section')
    expect(sections).toHaveLength(2)
    expect(sections[0]?.querySelector('.demo-source-panel')).not.toBeNull()
    expect(sections[1]?.querySelector('.demo-source-panel')).not.toBeNull()

    act(() => sections[1]
      ?.querySelector<HTMLButtonElement>('.app-expander__trigger')
      ?.click())
    expect(sections[1]?.querySelector('.shiki')).not.toBeNull()
    expect(sections[1]?.textContent).toContain('<AppLink href="#docs" />')
    expect(sections[1]?.textContent).not.toContain('<AppButton />')
  })

  it('can hide one source panel without shifting later section sources', () => {
    act(() => root.render(
      <DemoI18nContext.Provider
        value={{ locale: 'en-US', messages: demoMessages['en-US'] }}
      >
        <DemoSourceContext.Provider
          value={{
            path: 'example/src/pages/ExamplePage.tsx',
            sections: [
              {
                source: '<AppButton />',
                highlightedHtml:
                  '<pre class="shiki"><code>&lt;AppButton /&gt;</code></pre>',
              },
              {
                source: '<div className="diagram" />',
                highlightedHtml:
                  '<pre class="shiki"><code>&lt;div className="diagram" /&gt;</code></pre>',
              },
              {
                source: '<AppPage />',
                highlightedHtml:
                  '<pre class="shiki"><code>&lt;AppPage /&gt;</code></pre>',
              },
            ],
          }}
        >
          <DemoPage>
            <DemoSection title="Button example"><button>Preview</button></DemoSection>
            <DemoSection showSource={false} title="Diagram example"><div>Preview</div></DemoSection>
            <DemoSection title="Page example"><div>Preview</div></DemoSection>
          </DemoPage>
        </DemoSourceContext.Provider>
      </DemoI18nContext.Provider>,
    ))

    const sections = host.querySelectorAll('.demo-section')
    expect(sections).toHaveLength(3)
    expect(sections[0]?.querySelector('.demo-source-panel')).not.toBeNull()
    expect(sections[1]?.querySelector('.demo-source-panel')).toBeNull()
    expect(sections[2]?.querySelector('.demo-source-panel')).not.toBeNull()
    expect(sections[2]?.textContent).toContain('<AppPage />')
    expect(sections[2]?.textContent).not.toContain('<div className="diagram" />')
  })
})
