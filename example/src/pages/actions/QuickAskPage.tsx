import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AppButton,
  AppCommandProvider,
  AppConversationThread,
  AppQuickAsk,
  formatAppShortcut,
  type AppAiRequestStatus,
  type AppCommand,
} from '../../../../src'
import { MessageSquare, Sparkles } from '../../components/fluentIcons'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'
import { useDemoCopy } from '../../i18n/interactiveTranslations'
import {
  cloneTextMessages,
  initialChatMessages,
  toConversationMessages,
} from './aiFixtures'

const shortcut = { ctrl: true, shift: true, key: 'k' } as const

export function QuickAskPage() {
  const t = useDemoCopy()
  const [oneShotOpen, setOneShotOpen] = useState(false)
  const [oneShotDraft, setOneShotDraft] = useState('')
  const [oneShotAnswerText, setOneShotAnswer] = useState<string | null>(null)
  const [oneShotStatus, setOneShotStatus] =
    useState<AppAiRequestStatus>('idle')
  const oneShotTimerRef = useRef<number | null>(null)

  const [chatOpen, setChatOpen] = useState(false)
  const [chatDraft, setChatDraft] = useState('')
  const [chatMessages, setChatMessages] = useState(() =>
    cloneTextMessages(initialChatMessages),
  )
  const [chatStatus, setChatStatus] = useState<AppAiRequestStatus>('idle')
  const chatTimerRef = useRef<number | null>(null)
  const chatMessageIdRef = useRef(2)

  useEffect(
    () => () => {
      if (oneShotTimerRef.current !== null) {
        window.clearTimeout(oneShotTimerRef.current)
      }
      if (chatTimerRef.current !== null) {
        window.clearTimeout(chatTimerRef.current)
      }
    },
    [],
  )

  const stopOneShotTimer = () => {
    if (oneShotTimerRef.current === null) return
    window.clearTimeout(oneShotTimerRef.current)
    oneShotTimerRef.current = null
  }

  const submitOneShot = (prompt: string) => {
    stopOneShotTimer()
    void prompt
    setOneShotAnswer(null)
    setOneShotStatus('submitting')
    oneShotTimerRef.current = window.setTimeout(() => {
      oneShotTimerRef.current = null
      setOneShotAnswer(
        'This is a one-shot response. The host can keep or discard it after the surface closes.',
      )
      setOneShotStatus('completed')
    }, 520)
  }

  const cancelOneShot = () => {
    stopOneShotTimer()
    setOneShotAnswer('Generation stopped.')
    setOneShotStatus('completed')
  }

  const oneShotCommands = useMemo<AppCommand[]>(
    () => [
      {
        id: 'ai.quickAsk.oneShot',
        label: t('Open one-shot ask'),
        icon: <Sparkles />,
        shortcut,
        allowInEditable: true,
        execute: () => setOneShotOpen((current) => !current),
      },
    ],
    [t],
  )

  const stopChatTimer = () => {
    if (chatTimerRef.current === null) return
    window.clearTimeout(chatTimerRef.current)
    chatTimerRef.current = null
  }

  const nextChatMessageId = (role: 'user' | 'assistant') => {
    chatMessageIdRef.current += 1
    return `chat-${role}-${chatMessageIdRef.current}`
  }

  const submitChat = (prompt: string) => {
    stopChatTimer()
    setChatMessages((current) => [
      ...current,
      { id: nextChatMessageId('user'), role: 'user', text: prompt },
    ])
    setChatStatus('submitting')
    chatTimerRef.current = window.setTimeout(() => {
      chatTimerRef.current = null
      setChatMessages((current) => [
        ...current,
        {
          id: nextChatMessageId('assistant'),
          role: 'assistant',
          text: 'The follow-up was added to the current thread. The host can continue from this history.',
        },
      ])
      setChatStatus('completed')
    }, 520)
  }

  const cancelChat = () => {
    stopChatTimer()
    setChatMessages((current) => [
      ...current,
      {
        id: nextChatMessageId('assistant'),
        role: 'assistant',
        text: 'Generation stopped.',
      },
    ])
    setChatStatus('completed')
  }

  const chatThreadMessages = toConversationMessages(chatMessages, t)
  const footer = (
    <>
      <span>
        <kbd>Enter</kbd> {t('to send')}
      </span>
      <span>
        <kbd>Shift+Enter</kbd> {t('for a new line')}
      </span>
      <span>
        <kbd>Esc</kbd> {t('to hide')}
      </span>
    </>
  )

  return (
    <DemoPage>
      <DemoSection
        title="Quick ask: one prompt"
        description="Use AppQuickAsk as a transient one-shot prompt. The host owns the request and response state."
      >
        <DemoPreview className="demo-component-row">
          <AppCommandProvider commands={oneShotCommands}>
            <AppButton icon={<Sparkles />} onClick={() => setOneShotOpen(true)}>
              {t('Open one-shot ask')} · {formatAppShortcut(shortcut)}
            </AppButton>
            <AppQuickAsk
              answer={
                oneShotAnswerText ? (
                  <p>{t(oneShotAnswerText)}</p>
                ) : oneShotStatus === 'idle' ? (
                  <p>{t('Type a prompt to get a one-shot answer.')}</p>
                ) : undefined
              }
              footer={footer}
              onCancel={cancelOneShot}
              onOpenChange={setOneShotOpen}
              onSubmit={submitOneShot}
              onValueChange={setOneShotDraft}
              open={oneShotOpen}
              status={oneShotStatus}
              value={oneShotDraft}
            />
          </AppCommandProvider>
        </DemoPreview>
        <p className="demo-note">
          {t(
            'The one-shot example keeps only the latest answer in page state. Use it when each shortcut invocation is an independent request.',
          )}
        </p>
      </DemoSection>

      <DemoSection
        title="Chat: current thread"
        description="Use AppConversationThread when the surface should keep several user and AI turns. The host owns the message list."
      >
        <DemoPreview className="demo-component-row">
          <AppButton icon={<MessageSquare />} onClick={() => setChatOpen(true)}>
            {t('Open chat')}
          </AppButton>
          <AppQuickAsk
            answer={<AppConversationThread messages={chatThreadMessages} />}
            footer={footer}
            onCancel={cancelChat}
            onOpenChange={setChatOpen}
            onSubmit={submitChat}
            onValueChange={setChatDraft}
            open={chatOpen}
            status={chatStatus}
            value={chatDraft}
          />
        </DemoPreview>
        <p className="demo-note">
          {t(
            'This thread keeps the user and AI turns together. Submit another prompt to append a new turn.',
          )}
        </p>
      </DemoSection>
    </DemoPage>
  )
}
