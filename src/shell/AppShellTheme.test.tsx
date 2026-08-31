// @vitest-environment jsdom

import { act, type CSSProperties, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AppShell } from './AppShell'

describe('AppShell theme', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
      .IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
  })

  const render = (node: ReactNode) => act(() => root.render(node))
  const shell = () => container.querySelector<HTMLElement>('.app-shell')!

  it('defaults to the system scheme and blue preset', () => {
    render(<AppShell />)
    expect(shell().dataset.theme).toBe('system')
    expect(shell().dataset.themePreset).toBe('blue')
  })

  it('switches presets and schemes without replacing the shell', () => {
    render(<AppShell theme="light" themePreset="violet" />)
    const firstShell = shell()

    render(<AppShell theme="dark" themePreset="orange" />)

    expect(shell()).toBe(firstShell)
    expect(shell().dataset.theme).toBe('dark')
    expect(shell().dataset.themePreset).toBe('orange')
  })

  it('writes light and dark custom tokens to internal source variables', () => {
    render(
      <AppShell
        themeTokens={{
          common: { borderColor: '#777777' },
          light: { accentColor: '#6d5ce7', contentBg: '#faf9ff' },
          dark: { accentColor: '#b9adff', contentBg: '#252330' },
        }}
      />,
    )

    expect(shell().style.getPropertyValue('--app-theme-light-accent-color')).toBe(
      '#6d5ce7',
    )
    expect(shell().style.getPropertyValue('--app-theme-dark-accent-color')).toBe(
      '#b9adff',
    )
    expect(shell().style.getPropertyValue('--app-theme-light-content-bg')).toBe(
      '#faf9ff',
    )
    expect(shell().style.getPropertyValue('--app-theme-dark-content-bg')).toBe(
      '#252330',
    )
    expect(shell().style.getPropertyValue('--app-theme-light-border-color')).toBe(
      '#777777',
    )
    expect(shell().style.getPropertyValue('--app-theme-dark-border-color')).toBe(
      '#777777',
    )
  })

  it('lets the existing style prop remain the final escape hatch', () => {
    render(
      <AppShell
        style={
          {
            '--app-theme-light-accent-color': '#123456',
          } as CSSProperties
        }
        themeTokens={{ light: { accentColor: '#6d5ce7' } }}
      />,
    )

    expect(shell().style.getPropertyValue('--app-theme-light-accent-color')).toBe(
      '#123456',
    )
  })
})
