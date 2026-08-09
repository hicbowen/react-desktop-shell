// @vitest-environment jsdom

import { Fragment, useEffect, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppSelectorPanel, AppSelectorPanels } from './AppSelectorPanels'
import type { AppSelectorPanelsMotion } from './types'

describe('AppSelectorPanels', () => {
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

  const renderPanels = (
    value: string,
    mountStrategy: 'unmount' | 'hidden' = 'unmount',
    motion?: AppSelectorPanelsMotion,
  ) =>
    act(() =>
      root.render(
        <AppSelectorPanels
          className="custom-panels"
          motion={motion}
          mountStrategy={mountStrategy}
          value={value}
        >
          <Fragment>
            <AppSelectorPanel
              id="recent-panel"
              labelledBy="recent-selector"
              value="recent"
            >
              <Counter label="Recent" />
            </AppSelectorPanel>
            {null}
            <AppSelectorPanel value="favorites">
              <Counter label="Favorites" />
            </AppSelectorPanel>
          </Fragment>
          <span>Ignored content</span>
        </AppSelectorPanels>,
      ),
    )

  it('renders only the active panel with the default unmount strategy', () => {
    renderPanels('recent')

    const panelRoot = container.querySelector('.app-selector-panels')
    expect(panelRoot?.classList.contains('custom-panels')).toBe(true)
    expect(panelRoot?.getAttribute('data-motion')).toBe('entrance')
    expect(panelRoot?.getAttribute('data-direction')).toBe('neutral')
    expect(container.querySelectorAll('[role="region"]')).toHaveLength(1)
    expect(container.querySelector('[role="region"]')?.getAttribute('data-state')).toBe(
      'active',
    )
    expect(container.textContent).toContain('Recent: 0')
    expect(container.textContent).not.toContain('Favorites')
    expect(container.textContent).not.toContain('Ignored content')
    expect(container.querySelector('#recent-panel')?.getAttribute('aria-labelledby')).toBe(
      'recent-selector',
    )
  })

  it('keeps every panel mounted and hides inactive panels', () => {
    renderPanels('recent', 'hidden')

    const panels = container.querySelectorAll<HTMLElement>('[role="region"]')
    expect(panels).toHaveLength(2)
    expect(panels[0]?.hidden).toBe(false)
    expect(panels[0]?.classList.contains('app-selector-panel')).toBe(true)
    expect(panels[0]?.getAttribute('data-state')).toBe('active')
    expect(panels[1]?.hidden).toBe(true)
    expect(panels[1]?.getAttribute('aria-hidden')).toBe('true')
    expect(panels[1]?.getAttribute('data-state')).toBe('inactive')
  })

  it('derives directional motion from panel order', () => {
    renderPanels('recent', 'hidden', 'directional')
    const panelRoot = container.querySelector('.app-selector-panels')
    expect(panelRoot?.getAttribute('data-direction')).toBe('neutral')

    renderPanels('favorites', 'hidden', 'directional')
    expect(panelRoot?.getAttribute('data-direction')).toBe('forward')

    renderPanels('recent', 'hidden', 'directional')
    expect(panelRoot?.getAttribute('data-direction')).toBe('backward')
  })

  it('supports disabling panel motion', () => {
    renderPanels('recent', 'unmount', 'none')

    expect(
      container.querySelector('.app-selector-panels')?.getAttribute('data-motion'),
    ).toBe('none')
  })

  it('preserves local state with the hidden strategy', () => {
    renderPanels('recent', 'hidden')
    act(() => container.querySelector<HTMLButtonElement>('button')?.click())
    expect(container.textContent).toContain('Recent: 1')

    renderPanels('favorites', 'hidden')
    renderPanels('recent', 'hidden')

    expect(container.textContent).toContain('Recent: 1')
  })

  it('unmounts inactive panels and resets their local state', () => {
    const onUnmount = vi.fn()

    function TrackedPanel() {
      const [count, setCount] = useState(0)
      useEffect(() => () => onUnmount(), [])
      return <button onClick={() => setCount((value) => value + 1)}>{count}</button>
    }

    const renderTracked = (value: string) =>
      act(() =>
        root.render(
          <AppSelectorPanels value={value}>
            <AppSelectorPanel value="tracked"><TrackedPanel /></AppSelectorPanel>
            <AppSelectorPanel value="other">Other</AppSelectorPanel>
          </AppSelectorPanels>,
        ),
      )

    renderTracked('tracked')
    act(() => container.querySelector<HTMLButtonElement>('button')?.click())
    renderTracked('other')
    expect(onUnmount).toHaveBeenCalledTimes(1)

    renderTracked('tracked')
    expect(container.querySelector('button')?.textContent).toBe('0')
  })
})

function Counter({ label }: { label: string }) {
  const [count, setCount] = useState(0)
  return (
    <button type="button" onClick={() => setCount((value) => value + 1)}>
      {label}: {count}
    </button>
  )
}
