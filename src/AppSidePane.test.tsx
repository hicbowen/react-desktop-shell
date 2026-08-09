// @vitest-environment jsdom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AppSidePane } from './AppSidePane'

describe('AppSidePane scrolling', () => {
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

  it('keeps the header and footer outside the AppScrollArea viewport', () => {
    act(() =>
      root.render(
        <AppSidePane
          footer={<span>Pane footer</span>}
          open
          title="Pane title"
        >
          Pane body
        </AppSidePane>,
      ),
    )

    const scrollArea = container.querySelector<HTMLElement>(
      '.app-side-pane__body-scroll',
    )
    const viewport = scrollArea?.querySelector<HTMLElement>(
      ':scope > .app-side-pane__body',
    )
    expect(scrollArea?.classList).toContain('app-scroll-area')
    expect(viewport?.classList).toContain('app-scroll-area__viewport')
    expect(viewport?.textContent).toBe('Pane body')
    expect(scrollArea?.previousElementSibling?.classList).toContain(
      'app-side-pane__header',
    )
    expect(scrollArea?.nextElementSibling?.classList).toContain(
      'app-side-pane__footer',
    )
  })
})
