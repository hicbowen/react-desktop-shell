// @vitest-environment jsdom
import { act, createRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppOverlayHostContext } from '../overlay/AppOverlayHostContext'
import { AppConfirmPopover } from './AppConfirmPopover'
import { AppPopover } from './AppPopover'

describe('AppPopover', () => {
  let host: HTMLDivElement
  let root: ReturnType<typeof createRoot>
  let frames: FrameRequestCallback[]
  let overlayHosts: HTMLDivElement[]

  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
    frames = []
    overlayHosts = []
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
    overlayHosts.forEach((overlayHost) => overlayHost.remove())
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  const trigger = () => host.querySelector<HTMLButtonElement>('button')!
  const popover = () => document.body.querySelector<HTMLElement>('.app-popover')
  const pointerDown = (target: EventTarget) => act(() => {
    target.dispatchEvent(new Event('pointerdown', { bubbles: true }))
  })
  const flushFrames = () => act(() => {
    while (frames.length > 0) frames.shift()?.(0)
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

  it('runs lightweight confirmation and closes after success', async () => {
    const confirm = vi.fn()
    const openChange = vi.fn()
    act(() => root.render(
      <AppConfirmPopover
        onConfirm={confirm}
        onOpenChange={openChange}
        title="Delete item?"
        trigger={<button type="button">Delete</button>}
      />,
    ))
    act(() => trigger().click())
    flushFrames()
    const dialog = document.body.querySelector<HTMLElement>('[role="dialog"]')
    const actions = document.body.querySelectorAll<HTMLButtonElement>(
      '.app-confirm-popover__actions button',
    )
    expect(dialog?.getAttribute('aria-labelledby')).toBeTruthy()
    expect(document.activeElement).toBe(actions[0])
    await act(async () => actions[1]?.click())
    flushFrames()
    expect(confirm).toHaveBeenCalledOnce()
    expect(openChange).toHaveBeenLastCalledWith(false)
    expect(popover()).toBeNull()
    expect(document.activeElement).toBe(trigger())
  })

  it('treats outside dismissal as cancellation', () => {
    const cancel = vi.fn()
    act(() => root.render(
      <AppConfirmPopover
        defaultOpen
        onCancel={cancel}
        onConfirm={() => undefined}
        title="Remove item?"
        trigger={<button type="button">Remove</button>}
      />,
    ))
    flushFrames()
    pointerDown(host)
    expect(cancel).toHaveBeenCalledOnce()
    expect(popover()).toBeNull()
  })

  it('stays open and blocks dismissal while confirmation is pending', async () => {
    let resolveConfirm!: () => void
    const pending = new Promise<void>((resolve) => {
      resolveConfirm = resolve
    })
    act(() => root.render(
      <AppConfirmPopover
        defaultOpen
        onConfirm={() => pending}
        title="Archive item?"
        trigger={<button type="button">Archive</button>}
      />,
    ))
    flushFrames()
    const actions = document.body.querySelectorAll<HTMLButtonElement>(
      '.app-confirm-popover__actions button',
    )
    act(() => actions[1]?.click())
    expect(actions[0]?.disabled).toBe(true)
    expect(actions[1]?.getAttribute('aria-busy')).toBe('true')
    pointerDown(host)
    expect(popover()).not.toBeNull()
    await act(async () => resolveConfirm())
    expect(popover()).toBeNull()
  })

  it('reports confirmation errors and keeps the popover open', async () => {
    const error = new Error('Failed')
    const onConfirmError = vi.fn()
    act(() => root.render(
      <AppConfirmPopover
        defaultOpen
        onConfirm={() => Promise.reject(error)}
        onConfirmError={onConfirmError}
        title="Retry action?"
        trigger={<button type="button">Retry</button>}
      />,
    ))
    flushFrames()
    const actions = document.body.querySelectorAll<HTMLButtonElement>(
      '.app-confirm-popover__actions button',
    )
    await act(async () => actions[1]?.click())
    expect(onConfirmError).toHaveBeenCalledWith(error)
    expect(popover()).not.toBeNull()
    expect(actions[1]?.getAttribute('aria-busy')).toBeNull()
  })

  it('is non-interactive until positioning finishes', () => {
    act(() => root.render(
      <AppPopover defaultOpen trigger={<button type="button">Open</button>}>
        Content
      </AppPopover>,
    ))
    expect(popover()?.style.pointerEvents).toBe('none')
    expect(popover()?.style.visibility).toBe('hidden')

    flushFrames()

    expect(popover()?.style.pointerEvents).toBe('auto')
    expect(popover()?.style.visibility).toBe('visible')
  })

  it('restores pointer interactions inside an overlay host', () => {
    const overlayHost = document.createElement('div')
    overlayHost.className = 'app-shell__overlay-host'
    overlayHost.style.pointerEvents = 'none'
    document.body.append(overlayHost)
    overlayHosts.push(overlayHost)

    act(() => root.render(
      <AppOverlayHostContext.Provider value={overlayHost}>
        <AppPopover defaultOpen trigger={<button type="button">Open</button>}>
          Content
        </AppPopover>
      </AppOverlayHostContext.Provider>,
    ))
    flushFrames()

    expect(popover()?.parentElement).toBe(overlayHost)
    expect(getComputedStyle(overlayHost).pointerEvents).toBe('none')
    expect(popover()?.style.pointerEvents).toBe('auto')
  })

  it('uses unnamed non-modal popover semantics by default', () => {
    act(() => root.render(
      <AppPopover defaultOpen trigger={<button type="button">Open</button>}>
        Content
      </AppPopover>,
    ))
    expect(popover()?.hasAttribute('role')).toBe(false)
    expect(popover()?.hasAttribute('aria-label')).toBe(false)
    expect(popover()?.hasAttribute('aria-modal')).toBe(false)
    expect(trigger().getAttribute('aria-haspopup')).toBe('true')
  })

  it('exposes a named region when an accessible label is provided', () => {
    act(() => root.render(
      <AppPopover
        ariaLabel="Quick edit"
        defaultOpen
        trigger={<button type="button">Open</button>}
      >
        Content
      </AppPopover>,
    ))
    expect(popover()?.getAttribute('role')).toBe('region')
    expect(popover()?.getAttribute('aria-label')).toBe('Quick edit')
    expect(popover()?.hasAttribute('aria-modal')).toBe(false)
  })

  it('links the trigger to the popover only while open', () => {
    act(() => root.render(
      <AppPopover trigger={<button type="button">Open</button>}>
        Content
      </AppPopover>,
    ))
    expect(trigger().getAttribute('aria-expanded')).toBe('false')
    expect(trigger().hasAttribute('aria-controls')).toBe(false)

    act(() => trigger().click())

    expect(trigger().getAttribute('aria-expanded')).toBe('true')
    expect(trigger().getAttribute('aria-controls')).toBe(popover()?.id)
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
    pointerDown(content)
    expect(popover()).not.toBeNull()
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

  it('preserves focus on an outside button after dismissal', () => {
    act(() => root.render(<>
      <AppPopover defaultOpen trigger={<button type="button">Open</button>}>
        Content
      </AppPopover>
      <button type="button">Outside action</button>
    </>))
    const outside = Array.from(host.querySelectorAll('button')).find(
      (button) => button.textContent === 'Outside action',
    )!
    act(() => {
      outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
      outside.focus()
      outside.click()
    })
    expect(popover()).toBeNull()
    expect(document.activeElement).toBe(outside)
  })

  it('preserves focus on an outside input after dismissal', () => {
    act(() => root.render(<>
      <AppPopover defaultOpen trigger={<button type="button">Open</button>}>
        Content
      </AppPopover>
      <input aria-label="Outside field" />
    </>))
    const outside = host.querySelector<HTMLInputElement>('[aria-label="Outside field"]')!
    act(() => {
      outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
      outside.focus()
      outside.click()
    })
    expect(popover()).toBeNull()
    expect(document.activeElement).toBe(outside)
  })

  it('does not move focus when the trigger closes the popover', () => {
    act(() => root.render(
      <AppPopover defaultOpen trigger={<button type="button">Open</button>}>
        Content
      </AppPopover>,
    ))
    act(() => {
      trigger().focus()
      trigger().click()
    })
    expect(popover()).toBeNull()
    expect(document.activeElement).toBe(trigger())
  })

  it('does not move focus when a controlled parent rejects dismissal', () => {
    const change = vi.fn()
    act(() => root.render(
      <AppPopover onOpenChange={change} open trigger={<button type="button">Open</button>}>
        <input aria-label="Inside field" />
      </AppPopover>,
    ))
    const input = popover()!.querySelector<HTMLInputElement>('input')!
    act(() => {
      input.focus()
      document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }))
    })
    expect(change).toHaveBeenCalledWith(false)
    expect(popover()).not.toBeNull()
    expect(document.activeElement).toBe(input)
  })

  it('restores focus after a controlled parent accepts Escape dismissal', () => {
    function Harness() {
      const [open, setOpen] = useState(true)
      return <AppPopover
        onOpenChange={setOpen}
        open={open}
        trigger={<button type="button">Open</button>}
      >
        <input aria-label="Inside field" />
      </AppPopover>
    }
    act(() => root.render(<Harness />))
    act(() => popover()?.querySelector<HTMLInputElement>('input')?.focus())
    act(() => document.dispatchEvent(
      new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }),
    ))
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
    flushFrames()
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
