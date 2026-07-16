// @vitest-environment jsdom
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppExpander } from './AppExpander'

describe('AppExpander', () => {
  let host: HTMLDivElement; let root: ReturnType<typeof createRoot>; let frames: FrameRequestCallback[]
  beforeEach(() => { ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; host = document.createElement('div'); document.body.append(host); root = createRoot(host); frames = []; vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => { frames.push(callback); return frames.length })); vi.stubGlobal('cancelAnimationFrame', vi.fn()); vi.stubGlobal('matchMedia', vi.fn(() => ({ addEventListener: vi.fn(), matches: false, removeEventListener: vi.fn() }))) })
  afterEach(() => { act(() => root.unmount()); host.remove(); vi.restoreAllMocks(); vi.unstubAllGlobals() })
  const trigger = () => host.querySelector<HTMLButtonElement>('.app-expander__trigger')!
  const region = () => host.querySelector<HTMLElement>('.app-expander__region')!
  const flushFrame = () => act(() => frames.splice(0).forEach((frame) => frame(0)))
  const transitionEnd = () => act(() => region().dispatchEvent(new Event('transitionend', { bubbles: true })))

  it('hides collapsed content and links trigger with the region', () => { act(() => root.render(<AppExpander title="Advanced"><button type="button">Inside</button></AppExpander>)); expect(region().hidden).toBe(true); expect(region().hasAttribute('inert')).toBe(true); expect(trigger().getAttribute('aria-controls')).toBe(region().id); expect(region().getAttribute('aria-labelledby')).toBe(trigger().id) })
  it('reveals content before the expansion animation', () => { act(() => root.render(<AppExpander title="Advanced"><button type="button">Inside</button></AppExpander>)); act(() => trigger().click()); expect(region().hidden).toBe(false); expect(region().hasAttribute('inert')).toBe(false); flushFrame(); expect(host.querySelector('.app-expander')?.classList.contains('app-expander--expanded')).toBe(true) })
  it('hides after collapse transition and restores focus', () => { act(() => root.render(<AppExpander defaultExpanded title="Advanced"><button type="button">Inside</button></AppExpander>)); const inside = region().querySelector<HTMLButtonElement>('button')!; act(() => inside.focus()); act(() => trigger().click()); expect(region().hidden).toBe(false); expect(region().hasAttribute('inert')).toBe(true); transitionEnd(); expect(region().hidden).toBe(true); expect(document.activeElement).toBe(trigger()) })
  it('hides immediately with reduced motion', () => { vi.stubGlobal('matchMedia', vi.fn(() => ({ addEventListener: vi.fn(), matches: true, removeEventListener: vi.fn() }))); act(() => root.render(<AppExpander defaultExpanded title="Advanced"><button type="button">Inside</button></AppExpander>)); act(() => trigger().click()); expect(region().hidden).toBe(true) })
  it('reports controlled changes without changing itself', () => { const change = vi.fn(); act(() => root.render(<AppExpander expanded={false} onExpandedChange={change} title="Advanced">Content</AppExpander>)); act(() => trigger().click()); expect(change).toHaveBeenCalledWith(true); expect(trigger().getAttribute('aria-expanded')).toBe('false') })
  it('keeps actions independent and respects disabled state', () => { const action = vi.fn(); const change = vi.fn(); act(() => root.render(<AppExpander actions={<button onClick={action} type="button">Action</button>} onExpandedChange={change} title="Advanced">Content</AppExpander>)); act(() => host.querySelector<HTMLButtonElement>('.app-expander__actions button')?.click()); expect(action).toHaveBeenCalledOnce(); expect(change).not.toHaveBeenCalled(); act(() => root.render(<AppExpander disabled onExpandedChange={change} title="Advanced">Content</AppExpander>)); expect(trigger().disabled).toBe(true) })
})
