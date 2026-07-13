// @vitest-environment jsdom

import { act, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AppCard } from './AppCard'
import { AppCardGroup } from './AppCardGroup'

describe('AppCardGroup', () => {
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
  const group = () => container.querySelector<HTMLElement>('.app-card-group')!

  it('renders one or multiple cards', () => {
    render(
      <AppCardGroup>
        <AppCard>One</AppCard>
        <AppCard>Two</AppCard>
      </AppCardGroup>,
    )
    expect(container.querySelectorAll('.app-card')).toHaveLength(2)
  })

  it('defaults to vertical and divided', () => {
    render(<AppCardGroup><AppCard>One</AppCard></AppCardGroup>)
    expect(group().dataset.orientation).toBe('vertical')
    expect(group().dataset.divided).toBe('true')
    expect(group().classList).toContain('app-card-group--divided')
  })

  it('maps horizontal orientation and divided false', () => {
    render(<AppCardGroup divided={false} orientation="horizontal" />)
    expect(group().dataset.orientation).toBe('horizontal')
    expect(group().dataset.divided).toBe('false')
    expect(group().classList).not.toContain('app-card-group--divided')
  })

  it('renders non-Card children without throwing', () => {
    render(<AppCardGroup><span>Custom child</span></AppCardGroup>)
    expect(container.textContent).toContain('Custom child')
  })

  it('renders safely without children', () => {
    render(<AppCardGroup />)
    expect(group()).toBeTruthy()
  })

  it('forwards className and HTML attributes', () => {
    render(
      <AppCardGroup
        aria-label="Settings"
        className="custom-group"
        data-testid="group"
      />,
    )
    expect(group().classList).toContain('custom-group')
    expect(group().getAttribute('aria-label')).toBe('Settings')
    expect(group().dataset.testid).toBe('group')
  })
})
