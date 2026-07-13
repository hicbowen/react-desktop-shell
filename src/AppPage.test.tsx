// @vitest-environment jsdom

import { act, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AppPage } from './AppPage'

describe('AppPage layout', () => {
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
  const page = () => container.querySelector<HTMLElement>('.app-page')!
  const frame = () =>
    container.querySelector<HTMLElement>('.app-page__frame')!

  it('uses flow layout by default', () => {
    render(<AppPage>Content</AppPage>)

    expect(page().classList).not.toContain('app-page--fill')
    expect(frame()).not.toBeNull()
  })

  it('adds the fill class for fill layout', () => {
    render(<AppPage layout="fill">Content</AppPage>)

    expect(page().classList).toContain('app-page--fill')
  })

  it('always renders the stable frame class', () => {
    render(<AppPage title="Page">Content</AppPage>)

    expect(frame().parentElement).toBe(page())
  })

  it('combines frame and layout classes when a side pane is present', () => {
    render(<AppPage sidePane={<aside>Details</aside>}>Content</AppPage>)

    expect(frame().classList).toContain('app-page__frame')
    expect(frame().classList).toContain('app-page__layout')
  })
})
