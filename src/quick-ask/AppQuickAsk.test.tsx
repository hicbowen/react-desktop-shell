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
      document.body.querySelector('.app-quick-ask__response-header')
        ?.textContent,
    ).toContain('Responding')
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

  it('waits for tool approval without submitting another prompt', () => {
    const onSubmit = vi.fn()
    act(() =>
      root.render(
        <AppQuickAsk
          answer="Approval card"
          defaultValue="Another prompt"
          onOpenChange={() => undefined}
          onSubmit={onSubmit}
          open
          status="awaiting-approval"
        />,
      ),
    )

    expect(document.body.textContent).toContain('Waiting for your approval')
    const textarea = document.body.querySelector<HTMLTextAreaElement>(
      '.app-quick-ask textarea',
    )!
    const send = document.body.querySelector<HTMLButtonElement>(
      'button[aria-label="Send"]',
    )!
    expect(send.disabled).toBe(true)
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

  it('hides the completed visual heading while retaining response semantics', () => {
    act(() =>
      root.render(
        <AppQuickAsk
          answer="Completed answer"
          onOpenChange={() => undefined}
          onSubmit={() => undefined}
          open
          status="completed"
        />,
      ),
    )

    expect(
      document.body.querySelector('.app-quick-ask__response-header'),
    ).toBeNull()
    expect(
      document.body
        .querySelector('.app-quick-ask__response')
        ?.classList.contains('app-quick-ask__response--without-header'),
    ).toBe(true)
    const answer = document.body.querySelector('.app-quick-ask__answer')
    expect(answer?.getAttribute('aria-label')).toBe('AI response')
    expect(answer?.textContent).toBe('Completed answer')
  })

  it('follows output near the bottom and pauses while reading history', () => {
    const onSubmit = vi.fn()
    const render = (answer: string) =>
      act(() =>
        root.render(
          <AppQuickAsk
            answer={answer}
            onOpenChange={() => undefined}
            onSubmit={onSubmit}
            open
            status="completed"
          />,
        ),
      )

    render('First answer')
    const viewport = document.body.querySelector<HTMLDivElement>(
      '.app-quick-ask__response-viewport',
    )!
    let scrollHeight = 400
    let scrollTop = 0
    Object.defineProperties(viewport, {
      clientHeight: { configurable: true, get: () => 100 },
      scrollHeight: { configurable: true, get: () => scrollHeight },
      scrollTop: {
        configurable: true,
        get: () => scrollTop,
        set: (value: number) => {
          scrollTop = value
        },
      },
    })

    render('Second answer')
    expect(viewport.scrollTop).toBe(400)

    viewport.scrollTop = 100
    act(() => viewport.dispatchEvent(new Event('scroll')))
    scrollHeight = 600
    render('Third answer')
    expect(viewport.scrollTop).toBe(100)

    viewport.scrollTop = 500
    act(() => viewport.dispatchEvent(new Event('scroll')))
    scrollHeight = 700
    render('Fourth answer')
    expect(viewport.scrollTop).toBe(700)

    viewport.scrollTop = 100
    act(() => viewport.dispatchEvent(new Event('scroll')))
    scrollHeight = 800
    const textarea = document.body.querySelector<HTMLTextAreaElement>(
      '.app-quick-ask textarea',
    )!
    setTextAreaValue(textarea, 'Continue')
    act(() =>
      textarea.dispatchEvent(
        new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          key: 'Enter',
        }),
      ),
    )
    expect(onSubmit).toHaveBeenCalledWith('Continue')
    expect(viewport.scrollTop).toBe(800)
  })

  it('can opt out of following output', () => {
    const render = (answer: string) =>
      act(() =>
        root.render(
          <AppQuickAsk
            answer={answer}
            followOutput={false}
            onOpenChange={() => undefined}
            onSubmit={() => undefined}
            open
            status="completed"
          />,
        ),
      )

    render('First answer')
    const viewport = document.body.querySelector<HTMLDivElement>(
      '.app-quick-ask__response-viewport',
    )!
    let scrollTop = 0
    Object.defineProperties(viewport, {
      clientHeight: { configurable: true, get: () => 100 },
      scrollHeight: { configurable: true, get: () => 500 },
      scrollTop: {
        configurable: true,
        get: () => scrollTop,
        set: (value: number) => {
          scrollTop = value
        },
      },
    })

    render('Second answer')
    expect(viewport.scrollTop).toBe(0)
  })
})
