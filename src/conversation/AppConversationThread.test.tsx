// @vitest-environment jsdom

import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, expect, it } from 'vitest'
import { AppConversationThread } from './AppConversationThread'

describe('AppConversationThread', () => {
  it('renders a controlled current conversation with role labels', () => {
    const host = document.createElement('div')
    const root = createRoot(host)
    act(() =>
      root.render(
        <AppConversationThread
          messages={[
            { id: 'user-1', role: 'user', content: 'Summarize this' },
            { id: 'assistant-1', role: 'assistant', content: 'Ready' },
            {
              id: 'tool-1',
              role: 'tool',
              label: 'File tool',
              content: 'Approval required',
            },
          ]}
        />,
      ),
    )

    const thread = host.querySelector('[role="log"]')
    expect(thread?.getAttribute('aria-label')).toBe('Current conversation')
    expect(thread?.textContent).toContain('You')
    expect(thread?.textContent).toContain('AI')
    expect(thread?.textContent).toContain('File tool')
    expect(host.querySelectorAll('article')).toHaveLength(3)

    act(() => root.unmount())
  })
})
