// @vitest-environment jsdom
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppExpander } from './AppExpander'

describe('AppExpander', () => {
  let host: HTMLDivElement
  let root: ReturnType<typeof createRoot>
  let frames: Map<number, FrameRequestCallback>
  let nextFrameId: number
  let cancelFrame: ReturnType<typeof vi.fn<(id: number) => boolean>>

  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
    frames = new Map()
    nextFrameId = 0
    vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
      const id = ++nextFrameId
      frames.set(id, callback)
      return id
    }))
    cancelFrame = vi.fn((id: number) => frames.delete(id))
    vi.stubGlobal('cancelAnimationFrame', cancelFrame)
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

  const trigger = () => host.querySelector<HTMLButtonElement>('.app-expander__trigger')!
  const region = () => host.querySelector<HTMLElement>('.app-expander__region')!
  const expander = () => host.querySelector<HTMLElement>('.app-expander')!
  const flushFrame = () => act(() => {
    const pending = Array.from(frames.values())
    frames.clear()
    pending.forEach((frame) => frame(0))
  })
  const transitionEnd = () => act(() => region().dispatchEvent(
    new Event('transitionend', { bubbles: true }),
  ))
  const renderControlled = (expanded: boolean) => act(() => root.render(
    <AppExpander expanded={expanded} title="Advanced">
      <button type="button">Inside</button>
    </AppExpander>,
  ))

  it('hides collapsed content and links trigger with the region', () => {
    act(() => root.render(
      <AppExpander title="Advanced"><button type="button">Inside</button></AppExpander>,
    ))
    expect(region().hidden).toBe(true)
    expect(region().hasAttribute('inert')).toBe(true)
    expect(trigger().getAttribute('aria-controls')).toBe(region().id)
    expect(region().getAttribute('aria-labelledby')).toBe(trigger().id)
  })

  it('reveals uncontrolled content before the expansion animation', () => {
    act(() => root.render(
      <AppExpander title="Advanced"><button type="button">Inside</button></AppExpander>,
    ))
    act(() => trigger().click())
    expect(region().hidden).toBe(false)
    expect(region().hasAttribute('inert')).toBe(false)
    expect(expander().classList.contains('app-expander--expanded')).toBe(false)
    flushFrame()
    expect(expander().classList.contains('app-expander--expanded')).toBe(true)
  })

  it('stages controlled expansion across a frame', () => {
    renderControlled(false)
    expect(region().hidden).toBe(true)

    renderControlled(true)
    expect(region().hidden).toBe(false)
    expect(expander().classList.contains('app-expander--expanded')).toBe(false)

    flushFrame()
    expect(expander().classList.contains('app-expander--expanded')).toBe(true)
  })

  it('hides controlled content after the collapse transition', () => {
    renderControlled(true)
    renderControlled(false)
    expect(expander().classList.contains('app-expander--expanded')).toBe(false)
    expect(region().hidden).toBe(false)
    expect(region().hasAttribute('inert')).toBe(true)
    transitionEnd()
    expect(region().hidden).toBe(true)
  })

  it('handles controlled false to true to false before the frame', () => {
    renderControlled(false)
    renderControlled(true)
    renderControlled(false)
    flushFrame()
    expect(region().hidden).toBe(true)
    expect(expander().classList.contains('app-expander--expanded')).toBe(false)
  })

  it('ignores a stale collapse transition after controlled reopening', () => {
    renderControlled(true)
    renderControlled(false)
    renderControlled(true)
    expect(region().hidden).toBe(false)
    expect(expander().classList.contains('app-expander--expanded')).toBe(false)
    transitionEnd()
    expect(region().hidden).toBe(false)
    flushFrame()
    expect(expander().classList.contains('app-expander--expanded')).toBe(true)
  })

  it('rapid uncontrolled toggle does not leave stale animation state', () => {
    act(() => root.render(<AppExpander title="Advanced">Content</AppExpander>))
    act(() => trigger().click())
    act(() => trigger().click())
    flushFrame()
    expect(region().hidden).toBe(true)
    expect(expander().classList.contains('app-expander--expanded')).toBe(false)
  })

  it('restores focus after the collapse transition', () => {
    act(() => root.render(
      <AppExpander defaultExpanded title="Advanced">
        <button type="button">Inside</button>
      </AppExpander>,
    ))
    const inside = region().querySelector<HTMLButtonElement>('button')!
    act(() => inside.focus())
    act(() => trigger().click())
    expect(region().hidden).toBe(false)
    transitionEnd()
    expect(region().hidden).toBe(true)
    expect(document.activeElement).toBe(trigger())
  })

  it('switches immediately with reduced motion', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({
      addEventListener: vi.fn(),
      matches: true,
      removeEventListener: vi.fn(),
    })))
    act(() => root.render(
      <AppExpander title="Advanced"><button type="button">Inside</button></AppExpander>,
    ))
    act(() => trigger().click())
    expect(region().hidden).toBe(false)
    expect(expander().classList.contains('app-expander--expanded')).toBe(true)
    act(() => trigger().click())
    expect(region().hidden).toBe(true)
    expect(expander().classList.contains('app-expander--expanded')).toBe(false)
  })

  it('reports controlled changes without changing itself', () => {
    const change = vi.fn()
    act(() => root.render(
      <AppExpander
        expanded={false}
        onExpandedChange={change}
        title="Advanced"
      >
        Content
      </AppExpander>,
    ))
    act(() => trigger().click())
    expect(change).toHaveBeenCalledWith(true)
    expect(trigger().getAttribute('aria-expanded')).toBe('false')
  })

  it('keeps actions independent and respects disabled state', () => {
    const action = vi.fn()
    const change = vi.fn()
    act(() => root.render(
      <AppExpander
        actions={<button onClick={action} type="button">Action</button>}
        onExpandedChange={change}
        title="Advanced"
      >
        Content
      </AppExpander>,
    ))
    act(() => host.querySelector<HTMLButtonElement>('.app-expander__actions button')?.click())
    expect(action).toHaveBeenCalledOnce()
    expect(change).not.toHaveBeenCalled()
    act(() => root.render(
      <AppExpander disabled onExpandedChange={change} title="Advanced">Content</AppExpander>,
    ))
    expect(trigger().disabled).toBe(true)
  })

  it('cancels a pending animation frame on unmount', () => {
    act(() => root.render(<AppExpander title="Advanced">Content</AppExpander>))
    act(() => trigger().click())
    expect(frames.size).toBe(1)
    act(() => root.unmount())
    expect(cancelFrame).toHaveBeenCalledOnce()
    expect(frames.size).toBe(0)
  })
})
