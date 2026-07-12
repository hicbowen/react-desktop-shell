// @vitest-environment jsdom

import { act, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AppDialogRegistration } from './AppDialogContext'
import { AppDialogLayer } from './AppDialogLayer'
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
