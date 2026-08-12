// @vitest-environment jsdom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppQuickAsk } from './AppQuickAsk'

describe('AppQuickAsk', () => {
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

  const setTextAreaValue = (textarea: HTMLTextAreaElement, value: string) => {
    act(() => {
      Object.getOwnPropertyDescriptor(
        HTMLTextAreaElement.prototype,
        'value',
      )?.set?.call(textarea, value)
      textarea.dispatchEvent(new Event('input', { bubbles: true }))
    })
  }

  it('submits a trimmed prompt with Enter and clears the internal draft', () => {
    const onSubmit = vi.fn()
    const onValueChange = vi.fn()
    act(() =>
      root.render(
        <AppQuickAsk
          onOpenChange={() => undefined}
          onSubmit={onSubmit}
          onValueChange={onValueChange}
          open
        />,
      ),
    )
    const textarea = document.body.querySelector<HTMLTextAreaElement>(
      '.app-quick-ask textarea',
    )!
    setTextAreaValue(textarea, '  Explain portals  ')
    onValueChange.mockClear()

    act(() =>
      textarea.dispatchEvent(
        new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          key: 'Enter',
        }),
      ),
    )
    expect(onSubmit).toHaveBeenCalledWith('Explain portals')
    expect(onValueChange).toHaveBeenCalledWith('')
    expect(textarea.value).toBe('')
  })

  it('keeps Shift+Enter and IME composition available for text entry', () => {
    const onSubmit = vi.fn()
    act(() =>
      root.render(
        <AppQuickAsk
          defaultValue="Draft"
          onOpenChange={() => undefined}
          onSubmit={onSubmit}
          open
        />,
      ),
    )
    const textarea = document.body.querySelector<HTMLTextAreaElement>(
      '.app-quick-ask textarea',
    )!

    act(() =>
      textarea.dispatchEvent(
        new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          key: 'Enter',
          shiftKey: true,
        }),
      ),
    )
    act(() =>
      textarea.dispatchEvent(
        new CompositionEvent('compositionstart', {
          bubbles: true,
        }),
      ),
    )
    act(() =>
      textarea.dispatchEvent(
        new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          key: 'Enter',
        }),
      ),
    )
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('renders streaming content and exposes an explicit stop action', () => {
    const onCancel = vi.fn()
    act(() =>
      root.render(
        <AppQuickAsk
          answer={<p>Streaming answer</p>}
          answerActions={<button type="button">Copy</button>}
          onCancel={onCancel}
          onOpenChange={() => undefined}
          onSubmit={() => undefined}
          open
          status="streaming"
        />,
      ),
    )

    expect(
      document.body.querySelector('.app-quick-ask__answer')?.textContent,
    ).toContain('Streaming answer')
    expect(
      document.body.querySelector('.app-quick-ask__answer-actions')
        ?.textContent,
    ).toBe('Copy')
    const stop = document.body.querySelector<HTMLButtonElement>(
      'button[aria-label="Stop generating"]',
    )!
    act(() => stop.click())
    expect(onCancel).toHaveBeenCalledOnce()
  })
})
