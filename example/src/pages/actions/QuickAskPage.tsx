import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AppAiActivity,
  AppAiComposer,
  AppConversationViewport,
  AppButton,
  AppChangeReviewCard,
  AppCommandProvider,
  AppPromptSuggestions,
  AppQuickAsk,
  AppQuickAskThread,
  AppToolApprovalCard,
  formatAppShortcut,
  type AppAiActivityStatus,
  type AppAiActivityStep,
  type AppChangeReviewFile,
  type AppChangeReviewStatus,
  type AppCommand,
  type AppPromptSuggestion,
  type AppQuickAskMessage,
  type AppQuickAskMessageRole,
  type AppQuickAskStatus,
  type AppToolApprovalStatus,
} from '../../../../src'
import { CheckCircle2, MessageSquare, Sparkles } from '../../components/fluentIcons'
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

  const [oneShotOpen, setOneShotOpen] = useState(false)
  const [oneShotDraft, setOneShotDraft] = useState('')
  const [oneShotAnswerText, setOneShotAnswer] = useState<string | null>(null)
  const [oneShotStatus, setOneShotStatus] = useState<AppQuickAskStatus>('idle')
  const oneShotTimerRef = useRef<number | null>(null)

  const [inlineDraft, setInlineDraft] = useState('')
  const [inlineSubmittedPrompt, setInlineSubmittedPrompt] = useState<string | null>(null)

  const [viewportMessages, setViewportMessages] = useState<DemoTextMessage[]>([
    {
      id: 'viewport-user-1',
      role: 'user',
      text: 'Can we keep this conversation on the page?',
    },
    {
      id: 'viewport-assistant-1',
      role: 'assistant',
      text: 'Yes. The page owns the thread, while the viewport handles follow and history navigation.',
    },
    {
      id: 'viewport-assistant-2',
      role: 'assistant',
      text: 'Scroll up to pause follow mode, then use Jump to latest when you are ready to return.',
    },
  ])
  const viewportMessageIdRef = useRef(2)

  const [chatOpen, setChatOpen] = useState(false)
  const [chatDraft, setChatDraft] = useState('')
  const [chatMessages, setChatMessages] = useState<DemoTextMessage[]>([
    {
      id: 'chat-user-1',
      role: 'user',
      text: 'What should we review in this thread?',
    },
    {
      id: 'chat-assistant-1',
      role: 'assistant',
      text: 'The current thread is ready. Ask a follow-up and the host will append the next turn.',
    },
  ])
  const [chatStatus, setChatStatus] = useState<AppQuickAskStatus>('idle')
  const chatTimerRef = useRef<number | null>(null)
  const chatMessageIdRef = useRef(2)

  const [approvalOpen, setApprovalOpen] = useState(false)
  const [approvalDraft, setApprovalDraft] = useState('')
  const [approvalMessages, setApprovalMessages] = useState<DemoMessage[]>([
    {
      id: 'approval-assistant-1',
      role: 'assistant',
      text: 'The assistant needs confirmation before it can save the meeting summary.',
    },
    { id: 'approval-tool-1', role: 'tool', status: 'pending' },
  ])
  const [approvalStatus, setApprovalStatus] =
    useState<AppQuickAskStatus>('awaiting-approval')
  const approvalTimerRef = useRef<number | null>(null)
  const approvalMessageIdRef = useRef(2)
  const reviewTimerRef = useRef<number | null>(null)
  const [reviewStatus, setReviewStatus] =
    useState<AppChangeReviewStatus>('pending')

  useEffect(
    () => () => {
      if (oneShotTimerRef.current !== null) {
        window.clearTimeout(oneShotTimerRef.current)
      }
      if (chatTimerRef.current !== null) {
        window.clearTimeout(chatTimerRef.current)
      }
      if (approvalTimerRef.current !== null) {
        window.clearTimeout(approvalTimerRef.current)
      }
      if (reviewTimerRef.current !== null) {
        window.clearTimeout(reviewTimerRef.current)
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

  const promptSuggestions = useMemo<AppPromptSuggestion[]>(
    () => [
      {
        id: 'summarize-page',
        label: t('Summarize this page'),
        description: t('Get the key points in a few bullets.'),
        prompt: t('Summarize this page'),
        icon: <Sparkles />,
      },
      {
        id: 'explain-selection',
        label: t('Explain the selected content'),
        description: t('Make the current selection easier to understand.'),
        prompt: t('Explain the selected content'),
        icon: <MessageSquare />,
      },
      {
        id: 'draft-reply',
        label: t('Draft a reply'),
        description: t('Turn the current context into a concise response.'),
        prompt: t('Draft a reply'),
        icon: <CheckCircle2 />,
      },
    ],
    [t],
  )

  const oneShotAnswer = oneShotAnswerText
    ? <p>{t(oneShotAnswerText)}</p>
    : oneShotStatus === 'idle'
      ? (
          <div>
            <p>{t('Start with a suggestion or type your own prompt.')}</p>
            <AppPromptSuggestions
              items={promptSuggestions}
              onSelect={(item) => setOneShotDraft(item.prompt)}
              size="compact"
            />
          </div>
        )
      : undefined

  const stopChatTimer = () => {
    if (chatTimerRef.current === null) return
    window.clearTimeout(chatTimerRef.current)
    chatTimerRef.current = null
  }

  const nextChatMessageId = (role: DemoTextMessage['role']) => {
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

  const chatThreadMessages: AppQuickAskMessage[] = chatMessages.map((message) => ({
    id: message.id,
    role: message.role,
    content: <p>{t(message.text)}</p>,
  }))

  const stopApprovalTimer = () => {
    if (approvalTimerRef.current === null) return
    window.clearTimeout(approvalTimerRef.current)
    approvalTimerRef.current = null
  }

  const nextApprovalMessageId = (role: DemoTextMessage['role']) => {
    approvalMessageIdRef.current += 1
    return `approval-${role}-${approvalMessageIdRef.current}`
  }

  const appendApprovalAssistant = (text: string) => {
    setApprovalMessages((current) => [
      ...current,
      {
        id: nextApprovalMessageId('assistant'),
        role: 'assistant',
        text,
      },
    ])
  }

  const approveTool = () => {
    stopApprovalTimer()
    setApprovalMessages((current) =>
      current.map((message) =>
        message.role === 'tool' && message.status === 'pending'
          ? { ...message, status: 'running' }
          : message,
      ),
    )
    setApprovalStatus('streaming')
    approvalTimerRef.current = window.setTimeout(() => {
      approvalTimerRef.current = null
      setApprovalMessages((current) =>
        current.map((message) =>
          message.role === 'tool' && message.status === 'running'
            ? { ...message, status: 'completed' }
            : message,
        ),
      )
      appendApprovalAssistant(
        'The summary was saved after confirmation. You can inspect the completed tool result in the same thread.',
      )
      setApprovalStatus('completed')
    }, 720)
  }

  const rejectTool = () => {
    stopApprovalTimer()
    setApprovalMessages((current) =>
      current.map((message) =>
        message.role === 'tool' && message.status === 'pending'
          ? { ...message, status: 'denied' }
          : message,
      ),
    )
    appendApprovalAssistant(
      'The request was rejected. The assistant keeps the result in the conversation.',
    )
    setApprovalStatus('completed')
  }

  const cancelApproval = () => {
    stopApprovalTimer()
    setApprovalMessages((current) =>
      current.map((message) =>
        message.role === 'tool' && message.status === 'running'
          ? { ...message, status: 'error' }
          : message,
      ),
    )
    appendApprovalAssistant('The approval flow was cancelled. No file was written.')
    setApprovalStatus('completed')
  }

  const submitApprovalFollowUp = (prompt: string) => {
    setApprovalMessages((current) => [
      ...current,
      { id: nextApprovalMessageId('user'), role: 'user', text: prompt },
    ])
    setApprovalStatus('submitting')
    approvalTimerRef.current = window.setTimeout(() => {
      approvalTimerRef.current = null
      appendApprovalAssistant(
        'The follow-up was added after the approval result. The host still owns this conversation history.',
      )
      setApprovalStatus('completed')
    }, 420)
  }

  const resetApproval = () => {
    stopApprovalTimer()
    approvalMessageIdRef.current = 2
    setApprovalMessages([
      {
        id: 'approval-assistant-1',
        role: 'assistant',
        text: 'The assistant needs confirmation before it can save the meeting summary.',
      },
      { id: 'approval-tool-1', role: 'tool', status: 'pending' },
    ])
    setApprovalStatus('awaiting-approval')
    setApprovalDraft('')
  }

  const reviewFiles = useMemo<AppChangeReviewFile[]>(
    () => [
      {
        id: 'meeting-summary',
        path: 'Documents/meeting-summary.md',
        summary: t('Add the decisions and next steps from the meeting.'),
        additions: 8,
        deletions: 0,
        diff: '@@ -0,0 +1,8 @@\n+# Meeting summary\n+\n+## Decisions\n+- Confirm the launch checklist\n+\n+## Next steps\n+- Share the checklist with the team',
      },
      {
        id: 'readme',
        path: 'Documents/README.md',
        summary: t('Link to the generated meeting summary.'),
        additions: 1,
        deletions: 1,
        diff: '@@ -4,1 +4,1 @@\n-See the meeting notes.\n+See the [meeting summary](meeting-summary.md).',
      },
    ],
    [t],
  )

  const applyReview = () => {
    if (reviewTimerRef.current !== null) {
      window.clearTimeout(reviewTimerRef.current)
    }
    setReviewStatus('applying')
    reviewTimerRef.current = window.setTimeout(() => {
      reviewTimerRef.current = null
      setReviewStatus('applied')
    }, 520)
  }

  const rejectReview = () => {
    if (reviewTimerRef.current !== null) {
      window.clearTimeout(reviewTimerRef.current)
      reviewTimerRef.current = null
    }
    setReviewStatus('rejected')
  }

  const resetReview = () => {
    if (reviewTimerRef.current !== null) {
      window.clearTimeout(reviewTimerRef.current)
      reviewTimerRef.current = null
    }
    setReviewStatus('pending')
  }

  const approvalThreadMessages: AppQuickAskMessage[] = approvalMessages.map(
    (message) => {
      if (message.role !== 'tool') {
        return {
          id: message.id,
          role: message.role,
          content: <p>{t(message.text)}</p>,
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
    },
  )

  const approvalToolStatus =
    approvalMessages.find((message) => message.role === 'tool')?.status ?? 'pending'
  const activityStatus: AppAiActivityStatus =
    approvalToolStatus === 'error'
      ? 'error'
      : approvalStatus === 'awaiting-approval'
        ? 'awaiting-approval'
        : approvalStatus === 'streaming'
          ? 'tool'
          : approvalStatus === 'submitting'
            ? 'thinking'
            : 'completed'
  const activitySteps: AppAiActivityStep[] = [
    {
      id: 'prepare',
      label: t('Prepare response'),
      status: approvalStatus === 'submitting' ? 'active' : 'completed',
    },
    {
      id: 'approval',
      label: t('Ask for approval'),
      detail: t('The assistant pauses before changing external state.'),
      status:
        approvalStatus === 'awaiting-approval'
          ? 'active'
          : approvalToolStatus === 'denied'
            ? 'error'
            : 'completed',
    },
    {
      id: 'tool',
      label: t('Run file tool'),
      status:
        approvalToolStatus === 'error'
          ? 'error'
          : approvalStatus === 'streaming'
            ? 'active'
            : approvalToolStatus === 'completed'
              ? 'completed'
              : 'pending',
    },
    {
      id: 'finish',
      label: t('Finish response'),
      status: approvalStatus === 'completed' ? 'completed' : 'pending',
    },
  ]

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

  const addViewportMessage = () => {
    viewportMessageIdRef.current += 1
    setViewportMessages((current) => [
      ...current,
      {
        id: `viewport-assistant-${viewportMessageIdRef.current}`,
        role: 'assistant',
        text: 'A new response was appended. If you were reading history, the viewport keeps your position and offers a jump action.',
      },
    ])
  }

  const loadEarlierViewportMessages = () => {
    viewportMessageIdRef.current += 1
    setViewportMessages((current) => [
      {
        id: `viewport-assistant-earlier-${viewportMessageIdRef.current}`,
        role: 'assistant',
        text: 'Earlier context was loaded by the host and prepended to this thread.',
      },
      ...current,
    ])
  }

  const viewportThreadMessages: AppQuickAskMessage[] = viewportMessages.map(
    (message) => ({
      id: message.id,
      role: message.role,
      content: <p>{t(message.text)}</p>,
    }),
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
              answer={oneShotAnswer}
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
        title="Inline AI composer"
        description="Use AppAiComposer directly in a page without the spotlight surface. The host still owns the conversation state."
      >
        <DemoPreview>
          <AppAiComposer
            onSubmit={(prompt) => setInlineSubmittedPrompt(prompt)}
            onValueChange={setInlineDraft}
            style={{ width: '100%' }}
            value={inlineDraft}
          />
          <p className="demo-note">
            {inlineSubmittedPrompt
              ? `${t('Last inline prompt:')} ${inlineSubmittedPrompt}`
              : t('The inline composer sends a prompt to the host.')}
          </p>
        </DemoPreview>
      </DemoSection>

      <DemoSection
        title="Conversation viewport"
        description="Use AppConversationViewport around a normal page thread. It owns follow and jump behavior, while the host owns messages and history loading."
      >
        <DemoPreview>
          <AppConversationViewport
            hasMore
            onLoadOlder={loadEarlierViewportMessages}
            style={{ height: 240, width: '100%' }}
          >
            <AppQuickAskThread messages={viewportThreadMessages} />
          </AppConversationViewport>
          <AppButton onClick={addViewportMessage}>
            {t('Add new response')}
          </AppButton>
        </DemoPreview>
      </DemoSection>

      <DemoSection
        title="Chat: current thread"
        description="Use AppQuickAskThread when the surface should keep several user and AI turns. The host owns the message list."
      >
        <DemoPreview className="demo-component-row">
          <AppButton icon={<MessageSquare />} onClick={() => setChatOpen(true)}>
            {t('Open chat')}
          </AppButton>
          <AppQuickAsk
            answer={<AppQuickAskThread messages={chatThreadMessages} />}
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

      <DemoSection
        title="Tool approval: explicit confirmation"
        description="Render AppToolApprovalCard as a tool message when an operation needs user approval. The host decides whether to run or reject it."
      >
        <DemoPreview className="demo-component-row">
          <AppAiActivity
            detail={t(
              activityStatus === 'awaiting-approval'
                ? 'The assistant is waiting for your decision.'
                : activityStatus === 'tool'
                  ? 'The file tool is running.'
                  : activityStatus === 'error'
                    ? 'No file changes were made.'
                    : activityStatus === 'completed'
                      ? 'The activity is complete.'
                      : 'The assistant is preparing the request.',
            )}
            size="compact"
            status={activityStatus}
            steps={activitySteps}
            style={{ flex: '1 1 360px' }}
          />
          <AppButton icon={<CheckCircle2 />} onClick={() => setApprovalOpen(true)}>
            {t('Open approval example')}
          </AppButton>
          <AppButton onClick={resetApproval}>{t('Reset approval')}</AppButton>
          <AppQuickAsk
            answer={<AppQuickAskThread messages={approvalThreadMessages} />}
            footer={footer}
            onCancel={cancelApproval}
            onOpenChange={setApprovalOpen}
            onSubmit={submitApprovalFollowUp}
            onValueChange={setApprovalDraft}
            open={approvalOpen}
            status={approvalStatus}
            value={approvalDraft}
          />
        </DemoPreview>
        <p className="demo-note">
          {t(
            'Approval state is host-owned: awaiting-approval blocks submit, and only the explicit approval callback runs the simulated tool.',
          )}
        </p>
      </DemoSection>

      <DemoSection
        title="Change review: apply or reject"
        description="Review proposed file changes before applying them. The host owns the final write operation."
      >
        <DemoPreview className="demo-component-row">
          <AppChangeReviewCard
            files={reviewFiles}
            onApply={applyReview}
            onReject={rejectReview}
            status={reviewStatus}
            style={{ flex: '1 1 480px', maxWidth: 560 }}
            title={t('Review generated file changes')}
          />
          <AppButton onClick={resetReview}>{t('Reset review')}</AppButton>
        </DemoPreview>
        <p className="demo-note">
          {t(
            'Approval answers whether a tool may run; change review shows the concrete result before it is applied.',
          )}
        </p>
      </DemoSection>
    </DemoPage>
  )
}
