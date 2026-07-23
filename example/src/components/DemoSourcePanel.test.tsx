// @vitest-environment jsdom
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DemoI18nContext, demoMessages } from '../i18n/DemoI18nContext'
import { DemoSourcePanel } from './DemoSourcePanel'

describe('DemoSourcePanel', () => {
  let host: HTMLDivElement
  let root: ReturnType<typeof createRoot>
  let writeText: ReturnType<typeof vi.fn<(text: string) => Promise<void>>>

  beforeEach(() => {
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
    writeText = vi.fn(async () => undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })
    vi.stubGlobal('matchMedia', vi.fn(() => ({
      addEventListener: vi.fn(),
      matches: true,
      removeEventListener: vi.fn(),
    })))
  })

  afterEach(() => {
    act(() => root.unmount())
    host.remove()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('renders collapsed source and copies it from the header action', async () => {
    act(() => root.render(
      <DemoI18nContext.Provider
        value={{ locale: 'en-US', messages: demoMessages['en-US'] }}
      >
        <DemoSourcePanel path="example.tsx" source="<AppButton />" />
      </DemoI18nContext.Provider>,
    ))

    const expanderTrigger = host.querySelector<HTMLButtonElement>(
      '.app-expander__trigger',
    )
    const copyButton = host.querySelector<HTMLButtonElement>(
      '.app-expander__actions button',
    )
    const region = host.querySelector<HTMLElement>('.app-expander__region')
    expect(expanderTrigger?.textContent).toContain('Example source')
    expect(expanderTrigger?.textContent).toContain('example.tsx')
    expect(region?.hidden).toBe(true)

    await act(async () => copyButton?.click())
    expect(writeText).toHaveBeenCalledWith('<AppButton />')
    expect(copyButton?.textContent).toContain('Copied')

    act(() => expanderTrigger?.click())
    expect(region?.hidden).toBe(false)
    expect(region?.textContent).toContain('<AppButton />')
  })
})
