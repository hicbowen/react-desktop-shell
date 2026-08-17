// @vitest-environment jsdom

import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, expect, it } from 'vitest'
import { AppConversationMessage } from './AppConversationMessage'

describe('AppConversationMessage', () => {
  it('places a host-formatted timestamp in the message metadata row', () => {
    const host = document.createElement('div')
    const root = createRoot(host)

    act(() =>
      root.render(
        <AppConversationMessage
          actions={<button type="button">Copy</button>}
          footer="Source details"
          role="assistant"
          timestamp="10:32"
          timestampDateTime="2026-08-13T10:32:00+08:00"
        >
          <p>Ready</p>
        </AppConversationMessage>,
      ),
    )

    expect(host.querySelector('article')?.dataset.messageRole).toBe('assistant')
    expect(host.querySelector('.app-conversation-message__label')?.textContent).toBe('AI')
    expect(host.querySelector('.app-conversation-message__header')?.textContent).toBe('AI')
    const timestamp = host.querySelector<HTMLTimeElement>(
      '.app-conversation-message__meta time',
    )
    expect(timestamp?.textContent).toBe('10:32')
    expect(timestamp?.dateTime).toBe(
      '2026-08-13T10:32:00+08:00',
    )
    expect(
      host.querySelector('.app-conversation-message__meta')?.firstElementChild
        ?.className,
    ).toBe('app-conversation-message__actions')
    expect(
      host.querySelector('.app-conversation-message__meta')?.lastElementChild
        ?.tagName,
    ).toBe('TIME')
    expect(host.textContent).toContain('Source details')
    expect(host.textContent).toContain('Copy')

    act(() => root.unmount())
  })

  it('mirrors timestamp and action order for user messages', () => {
    const host = document.createElement('div')
    const root = createRoot(host)

    act(() =>
      root.render(
        <AppConversationMessage
          actions={<button type="button">Edit</button>}
          metaVisibility="hover"
          role="user"
          timestamp="10:33"
          >
          Message
        </AppConversationMessage>,
      ),
    )

    const meta = host.querySelector('.app-conversation-message__meta')!
    expect(meta.classList).toContain('app-conversation-message__meta--hover')
    expect(meta.querySelector('time')?.classList).toContain(
      'app-conversation-message__timestamp--hover',
    )
    expect(meta.firstElementChild?.tagName).toBe('TIME')
    expect(meta.lastElementChild?.className).toBe(
      'app-conversation-message__actions',
    )

    act(() => root.unmount())
  })

  it('applies hover metadata visibility to tool timestamps without actions', () => {
    const host = document.createElement('div')
    const root = createRoot(host)

    act(() =>
      root.render(
        <AppConversationMessage
          metaVisibility="hover"
          role="tool"
          timestamp="10:34"
        >
          Tool result
        </AppConversationMessage>,
      ),
    )

    const meta = host.querySelector('.app-conversation-message__meta')!
    expect(meta.classList).toContain('app-conversation-message__meta--hover')
    expect(meta.querySelector('time')?.classList).toContain(
      'app-conversation-message__timestamp--hover',
    )

    act(() => root.unmount())
  })

  it('supports a custom header and suppresses the default header with label null', () => {
    const host = document.createElement('div')
    const root = createRoot(host)

    act(() =>
      root.render(
        <>
          <AppConversationMessage header="Custom header" role="tool">
            Tool result
          </AppConversationMessage>
          <AppConversationMessage label={null} role="system">
            System event
          </AppConversationMessage>
        </>,
      ),
    )

    expect(host.querySelectorAll('.app-conversation-message__header')).toHaveLength(1)
    expect(host.textContent).toContain('Custom header')
    expect(host.textContent).not.toContain('SystemSystem')

    act(() => root.unmount())
  })

  it('keeps a timestamp while suppressing the default role label', () => {
    const host = document.createElement('div')
    const root = createRoot(host)

    act(() =>
      root.render(
        <AppConversationMessage
          label={null}
          role="tool"
          timestamp="10:34"
        >
          Tool result
        </AppConversationMessage>,
      ),
    )

    expect(host.querySelector('.app-conversation-message__header')).toBeNull()
    expect(host.querySelector('time')?.textContent).toBe('10:34')

    act(() => root.unmount())
  })
})
