// @vitest-environment jsdom
import { act, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DemoI18nContext, demoMessages } from '../../i18n/DemoI18nContext'
import { AiInteractionPage } from './AiInteractionPage'
import { ConversationPage } from './ConversationPage'
import { QuickAskPage } from './QuickAskPage'

describe('AI example pages', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
  })

  const renderPage = (page: ReactNode) => {
    act(() => root.render(
      <DemoI18nContext.Provider
        value={{ locale: 'en-US', messages: demoMessages['en-US'] }}
      >
        {page}
      </DemoI18nContext.Provider>,
    ))
  }

  it('keeps QuickAsk focused on transient shortcut surfaces', () => {
    renderPage(<QuickAskPage />)

    const titles = Array.from(container.querySelectorAll('.demo-section h2')).map(
      (heading) => heading.textContent,
    )
    expect(titles).toEqual(['Quick ask: one prompt', 'Chat: current thread'])
    expect(container.querySelector('.app-conversation-viewport')).toBeNull()
    expect(container.querySelector('.app-ai-composer')).toBeNull()
    expect(container.querySelector('.app-ai-activity')).toBeNull()
  })

  it('shows the normal page conversation composition', () => {
    renderPage(<ConversationPage />)

    expect(container.querySelector('.app-conversation-viewport')).not.toBeNull()
    expect(container.querySelector('.app-conversation-thread')).not.toBeNull()
    expect(container.querySelector('.app-conversation-message')).not.toBeNull()
    expect(container.querySelector('.app-ai-message-actions')).not.toBeNull()
    expect(container.querySelectorAll('.app-conversation-message__avatar')).toHaveLength(3)
    expect(container.querySelectorAll('.app-conversation-message__avatar .app-avatar--medium')).toHaveLength(3)
    expect(container.querySelector('[aria-label="AI assistant"]')).not.toBeNull()
    expect(container.querySelector('[aria-label="Current user"]')).not.toBeNull()
    expect(container.querySelector('time')?.textContent).toBe('10:30')
    expect(container.querySelector('.app-ai-composer')).not.toBeNull()
    expect(container.textContent).toContain('Add new response')
  })

  it('shows AI interaction building blocks on their own page', () => {
    renderPage(<AiInteractionPage />)

    expect(container.querySelector('.app-prompt-suggestions')).not.toBeNull()
    expect(container.querySelector('.app-ai-activity')).not.toBeNull()
    expect(container.querySelector('.app-tool-approval-card')).not.toBeNull()
    expect(container.querySelector('.app-change-review-card')).not.toBeNull()
  })
})
