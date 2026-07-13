// @vitest-environment jsdom

import { act, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AppToolbar } from './AppToolbar'

describe('AppToolbar', () => {
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
  const toolbar = () =>
    container.querySelector<HTMLElement>('.app-toolbar')!

  it('uses the surface appearance by default', () => {
    render(<AppToolbar />)

    expect(toolbar().classList).toContain('app-toolbar--surface')
    expect(toolbar().classList).not.toContain('app-toolbar--flat')
  })

  it('supports the flat appearance and a custom class', () => {
    render(<AppToolbar appearance="flat" className="custom-toolbar" />)

    expect(toolbar().classList).toContain('app-toolbar--flat')
    expect(toolbar().classList).toContain('custom-toolbar')
  })

  it('renders the named regions', () => {
    render(
      <AppToolbar
        start={<span>Start</span>}
        status={<span>Status</span>}
        end={<span>End</span>}
      />,
    )

    expect(container.querySelector('.app-toolbar__start')?.textContent).toBe(
      'Start',
    )
    expect(container.querySelector('.app-toolbar__status')?.textContent).toBe(
      'Status',
    )
    expect(container.querySelector('.app-toolbar__end')?.textContent).toBe(
      'End',
    )
  })

  it('uses custom content instead of the named regions', () => {
    render(
      <AppToolbar
        start={<span>Start</span>}
        status={<span>Status</span>}
        end={<span>End</span>}
      >
        <span>Custom content</span>
      </AppToolbar>,
    )

    expect(toolbar().textContent).toBe('Custom content')
    expect(container.querySelector('.app-toolbar__start')).toBeNull()
    expect(container.querySelector('.app-toolbar__trailing')).toBeNull()
  })
})
