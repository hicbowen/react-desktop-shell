import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AppButton,
  AppCommandProvider,
  AppQuickAsk,
  AppQuickAskThread,
  AppToolApprovalCard,
  formatAppShortcut,
  type AppCommand,
  type AppQuickAskMessage,
  type AppQuickAskMessageRole,
  type AppQuickAskStatus,
  type AppToolApprovalStatus,
} from '../../../../src'
import { Sparkles } from '../../components/fluentIcons'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'
import { useDemoCopy } from '../../i18n/interactiveTranslations'

const shortcut = { ctrl: true, shift: true, key: 'k' } as const

interface DemoTextMessage {
  id: string
  role: Exclude<AppQuickAskMessageRole, 'tool'>
  text: string
}

interface DemoToolMessage {
  id: string
  role: 'tool'
  status: AppToolApprovalStatus
}

type DemoMessage = DemoTextMessage | DemoToolMessage

export function AppQuickAskPage() {
  const t = useDemoCopy()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState<DemoMessage[]>([])
  const [status, setStatus] = useState<AppQuickAskStatus>('idle')
  const timerRef = useRef<number | null>(null)
  const messageIdRef = useRef(0)

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    },
    [],
  )

  const nextMessageId = (prefix: string) => {
    messageIdRef.current += 1
    return `${prefix}-${messageIdRef.current}`
  }
  const stopTimer = () => {
    if (timerRef.current === null) return
    window.clearTimeout(timerRef.current)
    timerRef.current = null
  }
  const appendAssistantMessage = (text: string) => {
    setMessages((current) => [
      ...current,
      { id: nextMessageId('assistant'), role: 'assistant', text },
    ])
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
          text: t(
            'I prepared the summary. Allow the file tool to save it to your Documents folder.',
          ),
        },
        {
          id: nextMessageId('tool'),
          role: 'tool',
          status: 'pending',
        },
      ])
      setStatus('awaiting-approval')
    }, 520)
  }
  const approveTool = () => {
    setMessages((current) =>
      current.map((message) =>
        message.role === 'tool' && message.status === 'pending'
          ? { ...message, status: 'running' }
          : message,
      ),
    )
    setStatus('streaming')
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null
      setMessages((current) =>
        current.map((message) =>
          message.role === 'tool' && message.status === 'running'
            ? { ...message, status: 'completed' }
            : message,
        ),
      )
      appendAssistantMessage(
        t('The summary was saved successfully. You can continue asking here.'),
      )
      setStatus('completed')
    }, 720)
  }
  const rejectTool = () => {
    setMessages((current) =>
      current.map((message) =>
        message.role === 'tool' && message.status === 'pending'
          ? { ...message, status: 'denied' }
          : message,
      ),
    )
    appendAssistantMessage(
      t(
        'No file was written. The prepared summary remains in this conversation.',
      ),
    )
    setStatus('completed')
  }
  const cancel = () => {
    stopTimer()
    setMessages((current) =>
      current.map((message) =>
        message.role === 'tool' && message.status === 'running'
          ? { ...message, status: 'error' }
          : message,
      ),
    )
    appendAssistantMessage(t('Generation stopped.'))
    setStatus('completed')
  }

  const threadMessages: AppQuickAskMessage[] = messages.map((message) => {
    if (message.role !== 'tool') {
      return {
        id: message.id,
        role: message.role,
        content: <p>{message.text}</p>,
      }
    }

    return {
      id: message.id,
      role: 'tool',
      content: (
        <AppToolApprovalCard
          description={t(
            'This writes one new Markdown file. Existing files are not changed.',
          )}
          details={t('Target: Documents/meeting-summary.md')}
          onApprove={approveTool}
          onReject={rejectTool}
          status={message.status}
          title={t('Save meeting summary')}
        />
      ),
    }
  })

  const commands = useMemo<AppCommand[]>(
    () => [
      {
        id: 'ai.quickAsk',
        label: t('Open quick ask'),
        icon: <Sparkles />,
        shortcut,
        allowInEditable: true,
        execute: () => setOpen((current) => !current),
      },
    ],
    [t],
  )

  return (
    <DemoPage>
      <DemoSection
        title="Quick AI conversation"
        description="Keep the current conversation in a compact prompt surface and ask before a tool changes external state."
      >
        <DemoPreview className="demo-component-row">
          <AppCommandProvider commands={commands}>
            <AppButton icon={<Sparkles />} onClick={() => setOpen(true)}>
              {t('Open quick ask')} · {formatAppShortcut(shortcut)}
            </AppButton>
            <AppQuickAsk
              answer={
                threadMessages.length ? (
                  <AppQuickAskThread messages={threadMessages} />
                ) : undefined
              }
              footer={
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
              }
              onCancel={cancel}
              onOpenChange={setOpen}
              onSubmit={submit}
              onValueChange={setDraft}
              open={open}
              status={status}
              value={draft}
            />
          </AppCommandProvider>
        </DemoPreview>
        <p className="demo-note">
          {t(
            'Hide and reopen the surface without losing the conversation or pending approval. Only an explicit Allow once action runs the simulated tool.',
          )}
        </p>
      </DemoSection>
    </DemoPage>
  )
}
