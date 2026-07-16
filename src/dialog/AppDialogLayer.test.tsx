// @vitest-environment jsdom

import { act, createRef, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  AppDialogContext,
  type AppDialogRegistration,
} from './AppDialogContext'
import { AppDialog } from './AppDialog'
import { AppDialogLayer } from './AppDialogLayer'
import { AppPopover } from '../popover/AppPopover'
import { useDialogController } from './useDialogController'
import type { AppMessageBox } from './types'

function registration(
  id: string,
  overrides: Partial<AppDialogRegistration> = {},
): AppDialogRegistration {
  return {
    id,
    open: true,
    restoreFocusElement: null,
    title: 'Initial title',
    description: 'Initial description',
    children: 'Initial content',
    ...overrides,
  } as AppDialogRegistration
}

describe('AppDialogLayer', () => {
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
    vi.useRealTimers()
  })

  function render(dialogs: AppDialogRegistration[]) {
    act(() => root.render(<AppDialogLayer dialogs={dialogs} />))
  }

  it('refreshes children, title, and description while the id stays open', () => {
    render([
      registration('update', {
        title: 'Checking',
        description: 'Please wait',
        children: '正在检查更新……',
      }),
    ])

    render([
      registration('update', {
        title: 'Check complete',
        description: 'No update is required',
        children: '当前已是最新版本',
      }),
    ])

    expect(container.textContent).toContain('Check complete')
    expect(container.textContent).toContain('No update is required')
    expect(container.textContent).toContain('当前已是最新版本')
    expect(container.textContent).not.toContain('正在检查更新……')
  })

  it('uses the latest action state and callback', () => {
    const initialCallback = vi.fn()
    const latestCallback = vi.fn()

    render([
      registration('actions', {
        actions: (
          <button type="button" disabled onClick={initialCallback}>
            Checking…
          </button>
        ),
      }),
    ])

    let button = container.querySelector('button')
    expect(button?.disabled).toBe(true)

    render([
      registration('actions', {
        actions: (
          <button
            type="button"
            aria-busy="false"
            onClick={latestCallback}
          >
            Install update
          </button>
        ),
      }),
    ])

    button = container.querySelector('button')
    expect(button?.textContent).toBe('Install update')
    expect(button?.disabled).toBe(false)
    expect(button?.getAttribute('aria-busy')).toBe('false')
    act(() => button?.click())
    expect(latestCallback).toHaveBeenCalledOnce()
    expect(initialCallback).not.toHaveBeenCalled()
  })

  it('freezes the last content during exit and removes it after animation', () => {
    vi.useFakeTimers()
    render([registration('exit', { children: 'First value' })])
    render([registration('exit', { children: 'Last value' })])
    render([])

    expect(container.textContent).toContain('Last value')
    expect(container.textContent).not.toContain('First value')
    expect(container.querySelector('.app-dialog--exit')).not.toBeNull()

    act(() => vi.advanceTimersByTime(179))
    expect(container.textContent).toContain('Last value')

    act(() => vi.advanceTimersByTime(1))
    expect(container.querySelector('[role="dialog"]')).toBeNull()
    expect(container.querySelector('.app-dialog-layer')).toBeNull()
  })

  it('preserves stacking and lower dialog state when the top dialog closes', () => {
    vi.useFakeTimers()
    render([
      registration('lower', { children: 'Lower old' }),
      registration('top', { children: 'Top dialog' }),
    ])
    render([
      registration('lower', { children: 'Lower latest' }),
      registration('top', { children: 'Top dialog' }),
    ])

    let overlays = container.querySelectorAll<HTMLElement>(
      '.app-dialog-overlay',
    )
    expect(overlays).toHaveLength(2)
    expect(overlays[0]?.textContent).toContain('Lower latest')
    expect(overlays[1]?.dataset.topDialog).toBe('true')

    render([registration('lower', { children: 'Lower latest' })])
    overlays = container.querySelectorAll<HTMLElement>('.app-dialog-overlay')
    expect(overlays).toHaveLength(2)
    expect(overlays[0]?.dataset.topDialog).toBe('true')
    expect(overlays[1]?.classList).toContain('app-dialog-overlay--exit')

    act(() => vi.advanceTimersByTime(180))
    overlays = container.querySelectorAll<HTMLElement>('.app-dialog-overlay')
    expect(overlays).toHaveLength(1)
    expect(overlays[0]?.textContent).toContain('Lower latest')
    expect(overlays[0]?.dataset.topDialog).toBe('true')
  })

  it('hosts a popover inside the owning dialog focus scope', () => {
    const closeDialog = vi.fn()

    render([
      registration('with-popover', {
        onOpenChange: closeDialog,
        children: (
          <AppPopover defaultOpen trigger={<button type="button">Open</button>}>
            <input aria-label="Popover first value" />
            <input aria-label="Popover last value" />
          </AppPopover>
        ),
      }),
    ])

    const overlay = container.querySelector('.app-dialog-overlay')
    const localHost = overlay?.querySelector('.app-dialog__overlay-host')
    const popover = localHost?.querySelector('.app-popover')
    const inputs = popover?.querySelectorAll('input')
    const input = inputs?.[0]
    const trigger = overlay?.querySelector('button')

    expect(localHost).not.toBeNull()
    expect(popover?.parentElement).toBe(localHost)
    expect(document.body.querySelector(':scope > .app-popover')).toBeNull()

    Object.defineProperty(trigger, 'offsetParent', {
      configurable: true,
      value: overlay,
    })
    Object.defineProperty(input, 'offsetParent', {
      configurable: true,
      value: localHost,
    })
    Object.defineProperty(inputs?.[1], 'offsetParent', {
      configurable: true,
      value: localHost,
    })

    act(() => input?.focus())
    expect(document.activeElement).toBe(input)

    act(() => {
      input?.dispatchEvent(
        new KeyboardEvent('keydown', { bubbles: true, key: 'Tab' }),
      )
    })
    expect(document.activeElement).toBe(input)

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          key: 'Escape',
        }),
      )
    })
    expect(localHost?.querySelector('.app-popover')).toBeNull()
    expect(closeDialog).not.toHaveBeenCalled()
  })

  it('keeps overlay hosts isolated across stacked dialogs', () => {
    render([
      registration('lower-overlay', {
        children: (
          <AppPopover defaultOpen trigger={<button type="button">Lower</button>}>
            Lower popover
          </AppPopover>
        ),
      }),
      registration('upper-overlay', {
        children: (
          <AppPopover defaultOpen trigger={<button type="button">Upper</button>}>
            Upper popover
          </AppPopover>
        ),
      }),
    ])

    const hosts = container.querySelectorAll('.app-dialog__overlay-host')
    expect(hosts).toHaveLength(2)
    expect(hosts[0]?.textContent).toContain('Lower popover')
    expect(hosts[0]?.textContent).not.toContain('Upper popover')
    expect(hosts[1]?.textContent).toContain('Upper popover')
    expect(hosts[1]?.textContent).not.toContain('Lower popover')
  })

  it('preserves focused content across title, children, and action updates', () => {
    vi.spyOn(HTMLElement.prototype, 'offsetParent', 'get').mockReturnValue(
      container,
    )

    render([
      registration('focus-update', {
        children: (
          <>
            <input aria-label="First field" />
            <input aria-label="Second field" />
          </>
        ),
        actions: <button type="button">Save</button>,
      }),
    ])

    const second = container.querySelector<HTMLInputElement>(
      '[aria-label="Second field"]',
    )!
    expect(document.activeElement).toBe(
      container.querySelector('[aria-label="First field"]'),
    )
    act(() => second.focus())

    render([
      registration('focus-update', {
        title: 'Updated title',
        children: (
          <>
            <input aria-label="First field" />
            <input aria-label="Second field" />
          </>
        ),
        actions: (
          <button disabled type="button">
            Saving
          </button>
        ),
      }),
    ])

    expect(document.activeElement).toBe(second)
  })

  it('focuses the lower dialog when it becomes top without restoring background', () => {
    vi.useFakeTimers()
    vi.spyOn(HTMLElement.prototype, 'offsetParent', 'get').mockReturnValue(
      container,
    )
    const background = document.createElement('button')
    document.body.append(background)

    render([
      registration('lower-focus', {
        children: <input aria-label="Lower field" />,
        restoreFocusElement: background,
      }),
      registration('upper-focus', {
        children: <input aria-label="Upper field" />,
        restoreFocusElement: background,
      }),
    ])
    expect(document.activeElement).toBe(
      container.querySelector('[aria-label="Upper field"]'),
    )

    render([
      registration('lower-focus', {
        children: <input aria-label="Lower field" />,
        restoreFocusElement: background,
      }),
    ])
    const lower = container.querySelector('[aria-label="Lower field"]')
    expect(document.activeElement).toBe(lower)

    act(() => vi.advanceTimersByTime(180))
    expect(document.activeElement).toBe(lower)
    background.remove()
  })

  it('restores the opener only after the final dialog exits', () => {
    vi.useFakeTimers()
    const opener = document.createElement('button')
    document.body.append(opener)
    act(() => opener.focus())

    render([
      registration('restore-final', {
        children: <input />,
        restoreFocusElement: opener,
      }),
    ])
    render([])
    expect(document.activeElement).not.toBe(opener)

    act(() => vi.advanceTimersByTime(180))
    expect(document.activeElement).toBe(opener)
    opener.remove()
  })

  it('does not restore a removed opener', () => {
    vi.useFakeTimers()
    const opener = document.createElement('button')
    document.body.append(opener)

    render([
      registration('missing-opener', {
        restoreFocusElement: opener,
      }),
    ])
    opener.remove()
    render([])

    expect(() => act(() => vi.advanceTimersByTime(180))).not.toThrow()
  })

  it('updates an open AppDialog registration without unregistering it', () => {
    const register = vi.fn()
    const unregister = vi.fn()
    const registry = { register, unregister }

    act(() =>
      root.render(
        <AppDialogContext.Provider value={registry}>
          <AppDialog open title="First title" />
        </AppDialogContext.Provider>,
      ),
    )
    act(() =>
      root.render(
        <AppDialogContext.Provider value={registry}>
          <AppDialog open title="Updated title" />
        </AppDialogContext.Provider>,
      ),
    )

    expect(register).toHaveBeenCalledTimes(2)
    expect(unregister).not.toHaveBeenCalled()
  })

  it('uses an initial focus target inside the dialog overlay scope', () => {
    const initialFocus = createRef<HTMLInputElement>()

    render([
      registration('overlay-initial-focus', {
        initialFocus,
        children: (
          <AppPopover
            defaultOpen
            trigger={<button type="button">Open overlay</button>}
          >
            <input aria-label="Overlay initial field" ref={initialFocus} />
          </AppPopover>
        ),
      }),
    ])

    expect(document.activeElement).toBe(initialFocus.current)
    expect(
      container
        .querySelector('.app-dialog__overlay-host')
        ?.contains(initialFocus.current),
    ).toBe(true)
  })

  it('keeps message box resolve and cancel behavior working', async () => {
    let messageBox: AppMessageBox | undefined

    function Harness({ children }: { children?: ReactNode }) {
      const controller = useDialogController(undefined, () => {})
      messageBox = controller.messageBox

      return (
        <>
          {children}
          <AppDialogLayer dialogs={controller.dialogs} />
        </>
      )
    }

    act(() => root.render(<Harness />))
    let resultPromise: Promise<string | undefined>
    act(() => {
      resultPromise = messageBox!.show({
        message: 'Choose an option',
        buttons: [{ key: 'accept', label: 'Accept' }],
        cancelButton: 'cancel',
      })
    })
    act(() => {
      container.querySelector('button')?.click()
    })
    await expect(resultPromise!).resolves.toBe('accept')

    let cancelPromise: Promise<string | undefined>
    act(() => {
      cancelPromise = messageBox!.show({
        message: 'Cancelable',
        buttons: [{ key: 'ok', label: 'OK' }],
        cancelButton: 'cancel',
      })
    })
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })
    await expect(cancelPromise!).resolves.toBe('cancel')
  })
})
