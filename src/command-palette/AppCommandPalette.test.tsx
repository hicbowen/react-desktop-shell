// @vitest-environment jsdom

import { act, createRef } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppCommandPalette } from './AppCommandPalette'

describe('AppCommandPalette', () => {
  let host: HTMLDivElement
  let root: Root

  beforeEach(() => {
    ;(
      globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
  })

  afterEach(() => {
    act(() => root.unmount())
    host.remove()
  })

  const setInputValue = (input: HTMLInputElement, value: string) => {
    act(() => {
      Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value',
      )?.set?.call(input, value)
      input.dispatchEvent(new Event('input', { bubbles: true }))
    })
  }

  it('filters and executes commands with the keyboard', () => {
    const close = vi.fn()
    const execute = vi.fn()
    act(() =>
      root.render(
        <AppCommandPalette
          commands={[
            { id: 'file.open', label: 'Open file', execute },
            { id: 'file.save', label: 'Save file', execute: vi.fn() },
          ]}
          onOpenChange={close}
          open
        />,
      ),
    )

    const input = document.body.querySelector<HTMLInputElement>(
      '.app-command-palette__input',
    )!
    setInputValue(input, 'op')
    expect(document.body.querySelectorAll('[role="option"]')).toHaveLength(1)
    act(() =>
      input.dispatchEvent(
        new KeyboardEvent('keydown', {
          bubbles: true,
          key: 'Enter',
        }),
      ),
    )
    expect(execute).toHaveBeenCalledWith({
      commandId: 'file.open',
      source: 'palette',
    })
    expect(close).toHaveBeenCalledWith(false)
  })

  it('uses the shared spotlight surface and moves focus into its input', () => {
    act(() =>
      root.render(
        <AppCommandPalette
          ariaLabel="Available commands"
          commands={[]}
          onOpenChange={() => undefined}
          open
        />,
      ),
    )

    const surface = document.body.querySelector('.app-command-palette')
    const input = document.body.querySelector<HTMLInputElement>(
      '.app-command-palette__input',
    )
    expect(surface?.classList.contains('app-spotlight-surface')).toBe(true)
    expect(surface?.getAttribute('aria-label')).toBe('Available commands')
    expect(
      (surface?.parentElement as HTMLElement | null)?.style.paddingBlockStart,
    ).toBe('min(18vh, 140px)')
    expect(document.activeElement).toBe(input)
  })

  it('dismisses through the spotlight behavior and restores focus', () => {
    const triggerRef = createRef<HTMLButtonElement>()
    const close = vi.fn()
    const render = (open: boolean) =>
      act(() =>
        root.render(
          <>
            <button ref={triggerRef} type="button">
              Open commands
            </button>
            <AppCommandPalette commands={[]} onOpenChange={close} open={open} />
          </>,
        ),
      )

    render(false)
    triggerRef.current?.focus()
    render(true)
    act(() =>
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          key: 'Escape',
        }),
      ),
    )
    expect(close).toHaveBeenCalledWith(false)

    render(false)
    expect(document.activeElement).toBe(triggerRef.current)
  })
})
