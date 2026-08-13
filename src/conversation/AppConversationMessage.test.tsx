// @vitest-environment jsdom

import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, expect, it } from 'vitest'
import { AppConversationMessage } from './AppConversationMessage'

describe('AppConversationMessage', () => {
  it('places a host-formatted timestamp beside the role label', () => {
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
    expect(host.querySelector('time')?.textContent).toBe('10:32')
    expect(host.querySelector('time')?.dateTime).toBe(
      '2026-08-13T10:32:00+08:00',
    )
    expect(host.textContent).toContain('Source details')
    expect(host.textContent).toContain('Copy')

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
})
