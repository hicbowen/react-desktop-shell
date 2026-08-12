import { useEffect, useRef, useState } from 'react'
import {
  AppAiComposer,
  AppButton,
  AppConversationThread,
  AppConversationViewport,
  type AppAiRequestStatus,
} from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'
import { useDemoCopy } from '../../i18n/interactiveTranslations'
import {
  cloneTextMessages,
  initialConversationMessages,
  toConversationMessages,
  type DemoTextMessage,
} from './aiFixtures'

export function ConversationPage() {
  const t = useDemoCopy()
  const [draft, setDraft] = useState('')
  const [status, setStatus] = useState<AppAiRequestStatus>('idle')
  const [messages, setMessages] = useState(() =>
    cloneTextMessages(initialConversationMessages),
  )
  const messageIdRef = useRef(2)
  const timerRef = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    },
    [],
  )

  const nextMessageId = (role: DemoTextMessage['role']) => {
    messageIdRef.current += 1
    return `conversation-${role}-${messageIdRef.current}`
  }

  const stopTimer = () => {
    if (timerRef.current === null) return
    window.clearTimeout(timerRef.current)
    timerRef.current = null
  }

  const submit = (prompt: string) => {
    stopTimer()
    setMessages((current) => [
      ...current,
      { id: nextMessageId('user'), role: 'user', text: prompt },
    ])
    setStatus('submitting')
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null
      setMessages((current) => [
        ...current,
        {
          id: nextMessageId('assistant'),
          role: 'assistant',
          text: 'The follow-up was added to the current thread. The host can continue from this history.',
        },
      ])
      setStatus('completed')
    }, 520)
  }

  const cancel = () => {
    stopTimer()
    setMessages((current) => [
      ...current,
      {
        id: nextMessageId('assistant'),
        role: 'assistant',
        text: 'Generation stopped.',
      },
    ])
    setStatus('completed')
  }

  const addResponse = () => {
    setMessages((current) => [
      ...current,
      {
        id: nextMessageId('assistant'),
        role: 'assistant',
        text: 'A new response was appended. If you were reading history, the viewport keeps your position and offers a jump action.',
      },
    ])
  }

  const loadEarlier = () => {
    setMessages((current) => [
      {
        id: nextMessageId('assistant'),
        role: 'assistant',
        text: 'Earlier context was loaded by the host and prepended to this thread.',
      },
      ...current,
    ])
  }

  const threadMessages = toConversationMessages(messages, t)

  return (
    <DemoPage>
      <DemoSection
        title="Conversation: normal page"
        description="Compose a normal chat page from AppConversationThread, AppConversationViewport, and AppAiComposer. The host owns messages and request state."
      >
        <DemoPreview>
          <AppConversationViewport
            hasMore
            onLoadOlder={loadEarlier}
            style={{ height: 300, width: '100%' }}
          >
            <AppConversationThread messages={threadMessages} />
          </AppConversationViewport>
          <div className="demo-component-row">
            <AppButton onClick={addResponse}>{t('Add new response')}</AppButton>
          </div>
          <AppAiComposer
            onCancel={cancel}
            onSubmit={submit}
            onValueChange={setDraft}
            status={status}
            style={{ width: '100%' }}
            value={draft}
          />
        </DemoPreview>
        <p className="demo-note">
          {t(
            'Scroll up to pause follow mode, then use Jump to latest when you are ready to return.',
          )}
        </p>
      </DemoSection>
    </DemoPage>
  )
}
