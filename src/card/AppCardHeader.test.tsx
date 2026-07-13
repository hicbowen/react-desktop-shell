// @vitest-environment jsdom

import { act, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppCardHeader } from './AppCardHeader'

describe('AppCardHeader', () => {
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

  it('renders title and description', () => {
    render(<AppCardHeader title="Backup" description="Protect local data" />)
    expect(container.textContent).toContain('Backup')
    expect(container.textContent).toContain('Protect local data')
  })

  it('renders an icon when no image is supplied', () => {
    render(<AppCardHeader icon={<span data-testid="icon">I</span>} title="Title" />)
    expect(container.querySelector('[data-testid="icon"]')).not.toBeNull()
  })

  it('renders the image and gives it priority over an icon', () => {
    render(
      <AppCardHeader
        icon={<span data-testid="icon">I</span>}
        image={<span data-testid="image">Image</span>}
        title="Title"
      />,
    )
    expect(container.querySelector('[data-testid="image"]')).not.toBeNull()
    expect(container.querySelector('[data-testid="icon"]')).toBeNull()
  })

  it('renders an action without interfering with its behavior', () => {
    const onClick = vi.fn()
    render(
      <AppCardHeader
        action={<button onClick={onClick}>More</button>}
        title="Title"
      />,
    )
    act(() => container.querySelector('button')?.click())
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('forwards className and HTML attributes', () => {
    render(
      <AppCardHeader
        aria-label="Card heading"
        className="custom-header"
        data-testid="header"
        title="Title"
      />,
    )
    const header = container.querySelector<HTMLElement>('.app-card-header')!
    expect(header.classList).toContain('custom-header')
    expect(header.getAttribute('aria-label')).toBe('Card heading')
    expect(header.dataset.testid).toBe('header')
  })
})
