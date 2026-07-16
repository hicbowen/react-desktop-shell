// @vitest-environment jsdom
import { act, createRef } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppPopover } from './AppPopover'

describe('AppPopover', () => {
  let host: HTMLDivElement
  let root: ReturnType<typeof createRoot>
  let frames: FrameRequestCallback[]

  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
    frames = []
    vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
      frames.push(callback)
      return frames.length
    }))
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      bottom: 132,
      height: 32,
      left: 100,
      right: 220,
      top: 100,
      width: 120,
    } as DOMRect)
  })

  afterEach(() => {
    act(() => root.unmount())
    host.remove()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  const trigger = () => host.querySelector<HTMLButtonElement>('button')!
  const popover = () => document.body.querySelector<HTMLElement>('.app-popover')
  const pointerDown = (target: EventTarget) => act(() => {
    target.dispatchEvent(new Event('pointerdown', { bubbles: true }))
  })

  it('opens in a portal and preserves trigger events', () => {
    const original = vi.fn()
    act(() => root.render(
      <AppPopover trigger={<button onClick={original} type="button">Open</button>}>
        Content
      </AppPopover>,
    ))
    act(() => trigger().click())
    expect(original).toHaveBeenCalledOnce()
    expect(popover()?.parentElement).toBe(document.body)
    expect(trigger().getAttribute('aria-expanded')).toBe('true')
  })

  it('uses non-modal popover semantics', () => {
    act(() => root.render(
      <AppPopover defaultOpen trigger={<button type="button">Open</button>}>
        Content
      </AppPopover>,
    ))
    expect(popover()?.hasAttribute('role')).toBe(false)
    expect(popover()?.hasAttribute('aria-modal')).toBe(false)
    expect(trigger().getAttribute('aria-haspopup')).toBe('true')
  })

  it('keeps the popover open when an input is clicked', () => {
    act(() => root.render(
      <AppPopover defaultOpen trigger={<button type="button">Open</button>}>
        <input aria-label="Name" />
      </AppPopover>,
    ))
    const input = popover()?.querySelector<HTMLInputElement>('input')
    pointerDown(input!)
    act(() => input?.click())
    expect(popover()).not.toBeNull()
  })

  it('allows text input without dismissing the popover', () => {
    act(() => root.render(
      <AppPopover defaultOpen trigger={<button type="button">Open</button>}>
        <input aria-label="Name" />
      </AppPopover>,
    ))
    const input = popover()?.querySelector<HTMLInputElement>('input')
    act(() => {
      input?.focus()
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
      setter?.call(input, 'abc')
      input?.dispatchEvent(new Event('input', { bubbles: true }))
    })
    expect(input?.value).toBe('abc')
    expect(popover()).not.toBeNull()
  })

  it('keeps the popover open when an internal button is clicked', () => {
    const action = vi.fn()
    act(() => root.render(
      <AppPopover defaultOpen trigger={<button type="button">Open</button>}>
        <button onClick={action} type="button">Save</button>
      </AppPopover>,
    ))
    const button = popover()?.querySelector<HTMLButtonElement>('button')
    pointerDown(button!)
    act(() => button?.click())
    expect(action).toHaveBeenCalledOnce()
    expect(popover()).not.toBeNull()
  })

  it('keeps arbitrary interactive and React content inside the popover', () => {
    act(() => root.render(
      <AppPopover defaultOpen trigger={<button type="button">Open</button>}>
        <textarea aria-label="Description" />
        <select aria-label="Priority"><option>Normal</option></select>
        <input aria-label="Enabled" type="checkbox" />
        <span data-testid="custom-content">Custom content</span>
      </AppPopover>,
    ))
    const content = popover()!
    for (const element of content.querySelectorAll('textarea, select, input, [data-testid]')) {
      pointerDown(element)
      expect(popover()).not.toBeNull()
    }
  })

  it('closes only after an outside pointer down', () => {
    act(() => root.render(
      <AppPopover defaultOpen trigger={<button type="button">Open</button>}>
        Content
      </AppPopover>,
    ))
    pointerDown(document.body)
    expect(popover()).toBeNull()
  })

  it('closes on Escape and restores focus', () => {
    act(() => root.render(
      <AppPopover defaultOpen trigger={<button type="button">Open</button>}>
        Content
      </AppPopover>,
    ))
    act(() => document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' })))
    expect(popover()).toBeNull()
    expect(document.activeElement).toBe(trigger())
  })

  it('supports controlled state and interactive content', () => {
    const change = vi.fn()
    act(() => root.render(
      <AppPopover onOpenChange={change} open trigger={<button type="button">Open</button>}>
        <input aria-label="Name" />
      </AppPopover>,
    ))
    const input = popover()?.querySelector<HTMLInputElement>('input')
    act(() => input?.focus())
    expect(document.activeElement).toBe(input)
    act(() => trigger().click())
    expect(change).toHaveBeenCalledWith(false)
    expect(popover()).not.toBeNull()
  })

  it('applies trigger width and initial focus', () => {
    const initialFocusRef = createRef<HTMLInputElement>()
    act(() => root.render(
      <AppPopover
        defaultOpen
        initialFocusRef={initialFocusRef}
        matchTriggerWidth
        trigger={<button type="button">Open</button>}
      >
        <input ref={initialFocusRef} />
      </AppPopover>,
    ))
    act(() => frames.splice(0).forEach((frame) => frame(0)))
    expect(popover()?.style.minWidth).toBe('120px')
    expect(document.activeElement).toBe(initialFocusRef.current)
  })

  it('respects a trigger that prevents its default click behavior', () => {
    const change = vi.fn()
    act(() => root.render(
      <AppPopover
        onOpenChange={change}
        trigger={<button onClick={(event) => event.preventDefault()} type="button">Open</button>}
      >
        Content
      </AppPopover>,
    ))
    act(() => trigger().click())
    expect(change).not.toHaveBeenCalled()
    expect(popover()).toBeNull()
  })

  it('does not throw when its trigger is removed while open', () => {
    expect(() => act(() => {
      root.render(
        <AppPopover defaultOpen trigger={<button type="button">Open</button>}>
          Content
        </AppPopover>,
      )
      root.render(<div>Removed</div>)
    })).not.toThrow()
  })
})
