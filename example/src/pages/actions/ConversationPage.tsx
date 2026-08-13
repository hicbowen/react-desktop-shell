import { useEffect, useRef, useState } from 'react'
import {
  AppAiComposer,
  AppAiMarkdown,
  AppAiMessageActions,
  AppAvatar,
  AppButton,
  AppConversationThread,
  AppConversationViewport,
  AppDropDownButton,
  AppIconButton,
  AppToggleButton,
  type AppAiRequestStatus,
  type AppAiMessageFeedback,
} from '../../../../src'
import {
  ArrowUp,
  CheckCircle2,
  Mic,
  Plus,
  Sparkles,
  UserRound,
  WandSparkles,
} from '../../components/fluentIcons'
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
  const [feedback, setFeedback] = useState<
    Record<string, AppAiMessageFeedback>
  >({})
  const [lastAction, setLastAction] = useState<string | null>(null)
  const [contextAttached, setContextAttached] = useState(false)
  const [approvalMode, setApprovalMode] = useState(false)
  const [model, setModel] = useState('Balanced')
  const [embeddedDraft, setEmbeddedDraft] = useState('')
  const [embeddedLastPrompt, setEmbeddedLastPrompt] = useState<string | null>(
    null,
  )
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
      {
        id: nextMessageId('user'),
        role: 'user',
        text: prompt,
        timestamp: 'Just now',
      },
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
          timestamp: 'Just now',
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
        timestamp: 'Just now',
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
        timestamp: 'Just now',
      },
    ])
  }

  const loadEarlier = () => {
    setMessages((current) => [
      {
        id: nextMessageId('assistant'),
        role: 'assistant',
        text: 'Earlier context was loaded by the host and prepended to this thread.',
        timestamp: '10:22',
      },
      ...current,
    ])
  }

  const threadMessages = toConversationMessages(messages, t).map((message) => {
    const source = messages.find((item) => item.id === message.id)
    if (!source) return message

    return {
      ...message,
      avatar: source.role === 'assistant'
        ? (
            <AppAvatar
              icon={<Sparkles />}
              name={t('AI assistant')}
              size="medium"
            />
          )
        : (
            <AppAvatar
              icon={<UserRound />}
              name={t('Current user')}
              size="medium"
            />
          ),
      actions: source.role === 'assistant'
        ? (
            <AppAiMessageActions
              feedback={feedback[source.id] ?? null}
              onCopy={() => setLastAction(t('Copy response requested.'))}
              onFeedbackChange={(next) =>
                setFeedback((current) => ({ ...current, [source.id]: next }))
              }
              onRetry={() => {
                setLastAction(t('Retry requested.'))
                addResponse()
              }}
            />
          )
        : (
            <AppAiMessageActions
              onEdit={() => {
                setDraft(source.text)
                setLastAction(t('Message moved back to the composer.'))
              }}
            />
          ),
    }
  })

  return (
    <DemoPage>
      <DemoSection
        title="Conversation composer: surface"
        description="Use the self-contained surface mode on a normal chat page. The component owns the two-level input layout; the host supplies context, tools, model selection, voice behavior, messages, and request state."
      >
        <DemoPreview>
          <AppConversationViewport
            hasMore
            onLoadOlder={loadEarlier}
            style={{ height: 300, width: '100%' }}
          >
            <AppConversationThread messages={threadMessages} />
          </AppConversationViewport>
          <AppAiComposer
            appearance="surface"
            header={
              contextAttached ? (
                <div className="demo-component-row">
                  <span className="demo-note">{t('Current page attached')}</span>
                  <AppButton
                    appearance="subtle"
                    onClick={() => setContextAttached(false)}
                    size="compact"
                  >
                    {t('Remove')}
                  </AppButton>
                </div>
              ) : undefined
            }
            onCancel={cancel}
            onSubmit={submit}
            onValueChange={setDraft}
            status={status}
            style={{ width: '100%' }}
            submitIcon={<ArrowUp />}
            toolbarEnd={
              <>
                <AppDropDownButton
                  appearance="subtle"
                  icon={<WandSparkles />}
                  items={[
                    { key: 'Fast', label: t('Fast') },
                    { key: 'Balanced', label: t('Balanced') },
                    { key: 'Deep', label: t('Deep') },
                  ]}
                  menuAriaLabel={t('Choose response model')}
                  onSelect={(key) => setModel(key)}
                  size="compact"
                >
                  {t(model)}
                </AppDropDownButton>
                <AppIconButton
                  appearance="subtle"
                  ariaLabel={t('Start voice input')}
                  icon={<Mic />}
                  onClick={() => setLastAction(t('Voice input requested.'))}
                  shape="circular"
                  size="compact"
                />
              </>
            }
            toolbarStart={
              <>
                <AppIconButton
                  appearance="subtle"
                  ariaLabel={t('Attach context')}
                  icon={<Plus />}
                  onClick={() => setContextAttached(true)}
                  shape="circular"
                  size="compact"
                />
                <AppToggleButton
                  icon={<CheckCircle2 />}
                  onPressedChange={setApprovalMode}
                  pressed={approvalMode}
                  size="compact"
                >
                  {t('Ask before tools')}
                </AppToggleButton>
              </>
            }
            value={draft}
          />
          {lastAction ? <span className="demo-note">{lastAction}</span> : null}
        </DemoPreview>
        <p className="demo-note">
          {t(
            'Scroll up to pause follow mode, then use Jump to latest when you are ready to return.',
          )}
        </p>
      </DemoSection>

      <DemoSection
        title="AI message: Markdown"
        description="Render assistant content with AppAiMarkdown inside the message content slot. GFM lists, tables, links, code blocks, and code-copy feedback stay separate from message layout."
      >
        <DemoPreview>
          <div style={{ maxWidth: 760, width: '100%' }}>
            <AppAiMarkdown
              content={t(
                '## Current context\n\nThe assistant can return **structured content** while the host keeps message state.\n\n- Follow the latest response\n- Pause while reading history\n\n| State | Owner |\n| --- | --- |\n| Markdown | Component |\n| Conversation | Host |\n\n```ts\nconst followOutput = true\nconst maxRetries = 3\n\nconst messages = [\n  { role: \'user\', content: \'Summarize the thread\' },\n  { role: \'assistant\', content: \'Ready to continue\' },\n]\n\nconst latestMessage = messages.at(-1)\nconst canRetry = latestMessage?.role === \'assistant\' && maxRetries > 0\n```',
              )}
              onCopyCode={() => setLastAction(t('Markdown code copied.'))}
            />
          </div>
        </DemoPreview>
      </DemoSection>

      <DemoSection
        title="AI message: Markdown without highlighting"
        description="Disable AppAiMarkdown syntax highlighting when the host prefers a smaller plain-text code presentation. Code copying and Markdown layout remain available."
      >
        <DemoPreview>
          <div style={{ maxWidth: 760, width: '100%' }}>
            <AppAiMarkdown
              content={'```ts\nconst plainOutput = true\n```'}
              highlightCode={false}
              onCopyCode={() => setLastAction(t('Markdown code copied.'))}
            />
          </div>
        </DemoPreview>
      </DemoSection>

      <DemoSection
        title="Conversation composer: embedded"
        description="Use embedded mode when another component already owns the border, elevation, and surrounding surface, such as AppQuickAsk, a side pane, or a compact contextual panel."
      >
        <DemoPreview>
          <AppAiComposer
            appearance="embedded"
            onSubmit={(prompt) => {
              setEmbeddedLastPrompt(prompt)
              setEmbeddedDraft('')
            }}
            onValueChange={setEmbeddedDraft}
            placeholder={t('Ask about the current selection')}
            style={{ width: '100%' }}
            value={embeddedDraft}
          />
        </DemoPreview>
        <p className="demo-note">
          {embeddedLastPrompt
            ? `${t('Last embedded prompt:')} ${embeddedLastPrompt}`
            : t(
                'Embedded mode keeps the compact one-row composition used by shortcut surfaces.',
              )}
        </p>
      </DemoSection>
    </DemoPage>
  )
}
