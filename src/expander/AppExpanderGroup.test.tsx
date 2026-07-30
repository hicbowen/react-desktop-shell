// @vitest-environment jsdom

import { act, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppExpander } from './AppExpander'
import { AppExpanderGroup } from './AppExpanderGroup'

describe('AppExpanderGroup', () => {
  let host: HTMLDivElement
  let root: Root

  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
      .IS_REACT_ACT_ENVIRONMENT = true
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
    vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1))
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
    vi.stubGlobal('matchMedia', vi.fn(() => ({
      addEventListener: vi.fn(),
      matches: false,
      removeEventListener: vi.fn(),
    })))
  })

  afterEach(() => {
    act(() => root.unmount())
    host.remove()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  const render = (node: ReactNode) => act(() => root.render(node))
  const group = () => host.querySelector<HTMLElement>('.app-expander-group')!
  const triggers = () => Array.from(
    host.querySelectorAll<HTMLButtonElement>('.app-expander__trigger'),
  )
  const expandedStates = () => triggers().map(
    (trigger) => trigger.getAttribute('aria-expanded'),
  )

  it('renders a continuous independent group and forwards HTML attributes', () => {
    render(
      <AppExpanderGroup aria-label="Settings" className="custom-group">
        <AppExpander title="General">General content</AppExpander>
        <AppExpander title="Advanced">Advanced content</AppExpander>
      </AppExpanderGroup>,
    )

    expect(group().dataset.expansionMode).toBe('independent')
    expect(group().classList).toContain('custom-group')
    expect(group().getAttribute('aria-label')).toBe('Settings')
    expect(host.querySelectorAll('.app-expander')).toHaveLength(2)

    act(() => triggers()[0]?.click())
    act(() => triggers()[1]?.click())
    expect(expandedStates()).toEqual(['true', 'true'])
  })

  it('coordinates a single expanded item', () => {
    const change = vi.fn()
    render(
      <AppExpanderGroup
        defaultValue="general"
        expansionMode="single"
        onValueChange={change}
      >
        <AppExpander title="General" value="general">General content</AppExpander>
        <AppExpander title="Appearance" value="appearance">Appearance content</AppExpander>
      </AppExpanderGroup>,
    )

    expect(expandedStates()).toEqual(['true', 'false'])
    act(() => triggers()[1]?.click())
    expect(expandedStates()).toEqual(['false', 'true'])
    expect(change).toHaveBeenLastCalledWith('appearance')
  })

  it('can require one item to remain expanded in single mode', () => {
    const change = vi.fn()
    const itemChange = vi.fn()
    render(
      <AppExpanderGroup
        collapsible={false}
        defaultValue="general"
        expansionMode="single"
        onValueChange={change}
      >
        <AppExpander
          onExpandedChange={itemChange}
          title="General"
          value="general"
        >
          General content
        </AppExpander>
      </AppExpanderGroup>,
    )

    act(() => triggers()[0]?.click())
    expect(expandedStates()).toEqual(['true'])
    expect(change).not.toHaveBeenCalled()
    expect(itemChange).not.toHaveBeenCalled()
  })

  it('coordinates multiple expanded items', () => {
    const change = vi.fn()
    render(
      <AppExpanderGroup
        defaultValue={['general']}
        expansionMode="multiple"
        onValueChange={change}
      >
        <AppExpander title="General" value="general">General content</AppExpander>
        <AppExpander title="Appearance" value="appearance">Appearance content</AppExpander>
      </AppExpanderGroup>,
    )

    act(() => triggers()[1]?.click())
    expect(expandedStates()).toEqual(['true', 'true'])
    expect(change).toHaveBeenLastCalledWith(['general', 'appearance'])
  })

  it('reports controlled changes without changing the rendered value', () => {
    const change = vi.fn()
    render(
      <AppExpanderGroup
        expansionMode="single"
        onValueChange={change}
        value="general"
      >
        <AppExpander title="General" value="general">General content</AppExpander>
        <AppExpander title="Appearance" value="appearance">Appearance content</AppExpander>
      </AppExpanderGroup>,
    )

    act(() => triggers()[1]?.click())
    expect(change).toHaveBeenCalledWith('appearance')
    expect(expandedStates()).toEqual(['true', 'false'])
  })

  it('moves focus among enabled direct items with accordion navigation keys', () => {
    render(
      <AppExpanderGroup expansionMode="single">
        <AppExpander title="General" value="general">General content</AppExpander>
        <AppExpander disabled title="Managed" value="managed">Managed content</AppExpander>
        <AppExpander title="Advanced" value="advanced">Advanced content</AppExpander>
      </AppExpanderGroup>,
    )

    act(() => triggers()[0]?.focus())
    act(() => triggers()[0]?.dispatchEvent(
      new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }),
    ))
    expect(document.activeElement).toBe(triggers()[2])

    act(() => triggers()[2]?.dispatchEvent(
      new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }),
    ))
    expect(document.activeElement).toBe(triggers()[0])

    act(() => triggers()[0]?.dispatchEvent(
      new KeyboardEvent('keydown', { bubbles: true, key: 'End' }),
    ))
    expect(document.activeElement).toBe(triggers()[2])
  })
})
