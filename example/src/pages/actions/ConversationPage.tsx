import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AppAiComposer,
  AppAiMarkdown,
  AppAiMessageActions,
  AppButton,
  AppChangeReviewCard,
  AppConversationThread,
  AppConversationViewport,
  AppDropDownButton,
  AppIconButton,
  AppToolCallCard,
  AppToggleButton,
  type AppAiRunStatus,
  type AppAiMessageFeedback,
  type AppChangeReviewFile,
  type AppChangeReviewStatus,
  type AppConversationMessageItem,
  type AppToolCallStatus,
} from '../../../../src'
import {
  ArrowUp,
  CheckCircle2,
  Mic,
  Plus,
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

type WorkflowPhase =
  | 'awaiting-tool-approval'
  | 'running-tool'
  | 'awaiting-review'
  | 'applying-changes'
  | 'completed'
  | 'tool-rejected'
  | 'review-rejected'

const workflowRunStatuses: Record<WorkflowPhase, AppAiRunStatus> = {
  'awaiting-tool-approval': 'awaiting-approval',
  'running-tool': 'using-tool',
  'awaiting-review': 'awaiting-review',
  'applying-changes': 'using-tool',
  completed: 'completed',
  'tool-rejected': 'canceled',
  'review-rejected': 'canceled',
}

function getToolCallStatus(phase: WorkflowPhase): AppToolCallStatus {
  if (phase === 'awaiting-tool-approval') return 'awaiting-approval'
  if (phase === 'running-tool') return 'running'
  if (phase === 'tool-rejected') return 'rejected'
  return 'completed'
}

function getReviewStatus(phase: WorkflowPhase): AppChangeReviewStatus | null {
  if (phase === 'awaiting-review') return 'awaiting-review'
  if (phase === 'applying-changes') return 'applying'
  if (phase === 'completed') return 'applied'
  if (phase === 'review-rejected') return 'rejected'
  return null
}

export function ConversationPage() {
  const t = useDemoCopy()
  const [draft, setDraft] = useState('')
  const [chatRunStatus, setChatRunStatus] = useState<AppAiRunStatus>('idle')
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
  const [workflowPhase, setWorkflowPhase] = useState<WorkflowPhase>(
    'awaiting-tool-approval',
  )
  const workflowRunStatus = workflowRunStatuses[workflowPhase]
  const runStatus = chatRunStatus === 'idle' ? workflowRunStatus : chatRunStatus
  const toolCallStatus = getToolCallStatus(workflowPhase)
  const reviewStatus = getReviewStatus(workflowPhase)
  const messageIdRef = useRef(2)
  const timerRef = useRef<number | null>(null)
  const workflowTimerRef = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
      if (workflowTimerRef.current !== null) {
        window.clearTimeout(workflowTimerRef.current)
      }
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
    setChatRunStatus('thinking')
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
      setChatRunStatus('completed')
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
    setChatRunStatus('canceled')
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

  const stopWorkflowTimer = () => {
    if (workflowTimerRef.current === null) return
    window.clearTimeout(workflowTimerRef.current)
    workflowTimerRef.current = null
  }

  const approveWorkflowTool = () => {
    stopWorkflowTimer()
    setWorkflowPhase('running-tool')
    workflowTimerRef.current = window.setTimeout(() => {
      workflowTimerRef.current = null
      setWorkflowPhase('awaiting-review')
    }, 720)
  }

  const rejectWorkflowTool = () => {
    stopWorkflowTimer()
    setWorkflowPhase('tool-rejected')
  }

  const applyWorkflowReview = () => {
    stopWorkflowTimer()
    setWorkflowPhase('applying-changes')
    workflowTimerRef.current = window.setTimeout(() => {
      workflowTimerRef.current = null
      setWorkflowPhase('completed')
    }, 520)
  }

  const rejectWorkflowReview = () => {
    stopWorkflowTimer()
    setWorkflowPhase('review-rejected')
  }

  const resetWorkflow = () => {
    stopTimer()
    stopWorkflowTimer()
    setChatRunStatus('idle')
    setWorkflowPhase('awaiting-tool-approval')
  }

  const workflowReviewFiles = useMemo<AppChangeReviewFile[]>(
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

  const textThreadMessages = toConversationMessages(messages, t).map((message) => {
    const source = messages.find((item) => item.id === message.id)
    if (!source) return message

    return {
      ...message,
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

  const workflowMessages: AppConversationMessageItem[] = [
    {
      id: 'conversation-workflow-user-1',
      role: 'user',
      content: <p>{t('Please prepare the meeting summary and update the project README.')}</p>,
      actions: (
        <AppAiMessageActions
          onEdit={() => {
            setDraft(t('Please prepare the meeting summary and update the project README.'))
            setLastAction(t('Message moved back to the composer.'))
          }}
        />
      ),
      metaVisibility: 'hover',
      timestamp: '10:32',
      timestampDateTime: '2026-08-13T10:32:00+08:00',
    },
    {
      id: 'conversation-workflow-assistant-1',
      role: 'assistant',
      content: (
        <AppAiMarkdown
          content={t(
            'I can prepare the summary and update the README. I need your confirmation before the file tool runs.',
          )}
        />
      ),
      actions: (
        <AppAiMessageActions
          onCopy={() => setLastAction(t('Copy response requested.'))}
        />
      ),
      metaVisibility: 'hover',
      timestamp: '10:32',
      timestampDateTime: '2026-08-13T10:32:08+08:00',
    },
    {
      id: 'conversation-workflow-tool-approval',
      role: 'tool',
      content: (
        <AppToolCallCard
          description={t(
            'This prepares a meeting summary and updates the project README. Existing files are not changed.',
          )}
          details={t(
            'Targets: Documents/meeting-summary.md and Documents/README.md',
          )}
          onApprove={approveWorkflowTool}
          onReject={rejectWorkflowTool}
          status={toolCallStatus}
          statusLabel={
            toolCallStatus === 'running'
              ? t('Saving meeting summary…')
              : undefined
          }
          title={t('Save meeting summary')}
        />
      ),
      metaVisibility: 'hover',
      timestamp: '10:33',
      timestampDateTime: '2026-08-13T10:33:00+08:00',
    },
  ]

  if (reviewStatus !== null) {
    workflowMessages.push(
      {
        id: 'conversation-workflow-assistant-2',
        role: 'assistant',
        content: (
          <AppAiMarkdown
            content={t(
              'The tool finished and prepared concrete changes. Review them before applying.',
            )}
          />
        ),
        actions: (
          <AppAiMessageActions
            onCopy={() => setLastAction(t('Copy response requested.'))}
          />
        ),
        metaVisibility: 'hover',
        timestamp: '10:34',
        timestampDateTime: '2026-08-13T10:34:00+08:00',
      },
      {
        id: 'conversation-workflow-change-review',
        role: 'tool',
        content: (
          <AppChangeReviewCard
            files={workflowReviewFiles}
            onApply={applyWorkflowReview}
            onReject={rejectWorkflowReview}
            status={reviewStatus}
            title={t('Review generated file changes')}
          />
        ),
        metaVisibility: 'hover',
        timestamp: '10:34',
        timestampDateTime: '2026-08-13T10:34:08+08:00',
      },
    )

    if (reviewStatus === 'applied' || reviewStatus === 'rejected') {
      workflowMessages.push({
        id: 'conversation-workflow-assistant-3',
        role: 'assistant',
        content: (
          <AppAiMarkdown
            content={t(
              reviewStatus === 'applied'
                ? 'The reviewed changes were applied successfully.'
                : 'The change review was rejected. No files were updated.',
            )}
          />
        ),
        actions: (
          <AppAiMessageActions
            onCopy={() => setLastAction(t('Copy response requested.'))}
          />
        ),
        metaVisibility: 'hover',
        timestamp: '10:35',
        timestampDateTime: '2026-08-13T10:35:00+08:00',
      })
    }
  }

  if (toolCallStatus === 'rejected') {
    workflowMessages.push({
      id: 'conversation-workflow-assistant-rejected',
      role: 'assistant',
      content: (
        <AppAiMarkdown
          content={t(
            'No file was written. The prepared summary remains in this conversation.',
          )}
        />
      ),
      actions: (
        <AppAiMessageActions
          onCopy={() => setLastAction(t('Copy response requested.'))}
        />
      ),
      metaVisibility: 'hover',
      timestamp: '10:34',
      timestampDateTime: '2026-08-13T10:34:00+08:00',
    })
  }

  const threadMessages = [...textThreadMessages, ...workflowMessages]

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
            style={{ height: 520, width: '100%' }}
          >
            <AppConversationThread messages={threadMessages} />
          </AppConversationViewport>
          <div className="demo-component-row">
            <AppButton appearance="subtle" onClick={resetWorkflow} size="compact">
              {t('Reset workflow')}
            </AppButton>
          </div>
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
            runStatus={runStatus}
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
