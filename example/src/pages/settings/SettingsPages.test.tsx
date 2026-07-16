// @vitest-environment jsdom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DemoShellContext } from '../../components/DemoShellContext'
import { SettingsPage } from './SettingsPages'

describe('SettingsPage', () => {
  let host: HTMLDivElement
  let root: Root

  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
      .IS_REACT_ACT_ENVIRONMENT = true
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
    vi.stubGlobal('__APP_VERSION__', '0.9.0')
  })

  afterEach(() => {
    act(() => root.unmount())
    host.remove()
    vi.unstubAllGlobals()
  })

  it('updates shell preferences and disables dependent settings', () => {
    const setTheme = vi.fn()
    const setLocale = vi.fn()

    act(() =>
      root.render(
        <DemoShellContext.Provider
          value={{
            locale: 'system',
            railDisplayMode: 'auto',
            setLocale,
            setRailDisplayMode: vi.fn(),
            setTheme,
            theme: 'system',
          }}
        >
          <SettingsPage />
        </DemoShellContext.Provider>,
      ),
    )

    const theme = host.querySelector<HTMLSelectElement>(
      'select[aria-label="Theme"]',
    )!
    const language = host.querySelector<HTMLSelectElement>(
      'select[aria-label="Language"]',
    )!
    const feature = host.querySelector<HTMLInputElement>(
      'input[aria-label="Enable feature"]',
    )!
    const detail = host.querySelector<HTMLSelectElement>(
      'select[aria-label="Detail level"]',
    )!

    act(() => {
      theme.value = 'dark'
      theme.dispatchEvent(new Event('change', { bubbles: true }))
      language.value = 'zh-CN'
      language.dispatchEvent(new Event('change', { bubbles: true }))
    })

    expect(setTheme).toHaveBeenCalledWith('dark')
    expect(setLocale).toHaveBeenCalledWith('zh-CN')
    expect(detail.disabled).toBe(false)

    act(() => feature.click())

    expect(detail.disabled).toBe(true)
    expect(
      detail.closest('[aria-disabled="true"]'),
    ).not.toBeNull()
  })
})
