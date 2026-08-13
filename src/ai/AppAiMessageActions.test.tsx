// @vitest-environment jsdom

import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, expect, it, vi } from 'vitest'
import { AppAiMessageActions } from './AppAiMessageActions'

describe('AppAiMessageActions', () => {
  it('renders only supplied common actions and reports activation', () => {
    const host = document.createElement('div')
    const root = createRoot(host)
    const copy = vi.fn()
    const retry = vi.fn()
    const edit = vi.fn()

    act(() =>
      root.render(
        <AppAiMessageActions
          onCopy={copy}
          onEdit={edit}
          onRetry={retry}
        />,
      ),
    )

    expect(host.querySelector('[role="toolbar"]')?.getAttribute('aria-label')).toBe(
      'Message actions',
    )
    act(() => host.querySelector<HTMLButtonElement>('[aria-label="Copy response"]')?.click())
    act(() => host.querySelector<HTMLButtonElement>('[aria-label="Retry response"]')?.click())
    act(() => host.querySelector<HTMLButtonElement>('[aria-label="Edit message"]')?.click())
    expect(copy).toHaveBeenCalledOnce()
    expect(retry).toHaveBeenCalledOnce()
    expect(edit).toHaveBeenCalledOnce()

    act(() => root.unmount())
  })

  it('treats feedback as controlled and toggles the selected value', () => {
    const host = document.createElement('div')
    const root = createRoot(host)
    const change = vi.fn()

    act(() =>
      root.render(
        <AppAiMessageActions
          feedback="like"
          onFeedbackChange={change}
        />,
      ),
    )

    const like = host.querySelector<HTMLButtonElement>('[aria-label="Helpful"]')!
    const dislike = host.querySelector<HTMLButtonElement>('[aria-label="Not helpful"]')!
    expect(like.getAttribute('aria-pressed')).toBe('true')
    expect(dislike.getAttribute('aria-pressed')).toBe('false')
    act(() => like.click())
    act(() => dislike.click())
    expect(change).toHaveBeenNthCalledWith(1, null)
    expect(change).toHaveBeenNthCalledWith(2, 'dislike')

    act(() => root.unmount())
  })

  it('supports opt-in hover visibility while keeping the default visible', () => {
    const host = document.createElement('div')
    const root = createRoot(host)

    act(() =>
      root.render(
        <>
          <AppAiMessageActions onCopy={() => undefined} />
          <AppAiMessageActions onCopy={() => undefined} visibility="hover" />
        </>,
      ),
    )

    const actions = host.querySelectorAll('.app-ai-message-actions')
    expect(actions[0]?.classList).toContain('app-ai-message-actions--always')
    expect(actions[1]?.classList).toContain('app-ai-message-actions--hover')

    act(() => root.unmount())
  })
})
