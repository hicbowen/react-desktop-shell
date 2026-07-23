// @vitest-environment jsdom
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DemoI18nContext, demoMessages } from '../i18n/DemoI18nContext'
import { DemoPage } from './DemoPage'

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
})
