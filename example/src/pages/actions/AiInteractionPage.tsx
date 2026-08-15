import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AppAiStatus,
  AppButton,
  AppChangeReviewCard,
  AppPromptSuggestions,
  AppToolApprovalCard,
  type AppAiRunStatus,
  type AppChangeReviewFile,
  type AppChangeReviewStatus,
  type AppPromptSuggestion,
  type AppToolApprovalStatus,
} from '../../../../src'
import { CheckCircle2, MessageSquare, Sparkles } from '../../components/fluentIcons'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'
import { useDemoCopy } from '../../i18n/interactiveTranslations'
import { initialApprovalMessages } from './aiFixtures'

export function AiInteractionPage() {
  const t = useDemoCopy()
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null)
  const [runStatus, setRunStatus] =
    useState<AppAiRunStatus>('awaiting-approval')
  const [toolStatus, setToolStatus] = useState<AppToolApprovalStatus>(
    initialApprovalMessages.find((message) => message.role === 'tool')?.status ??
      'pending',
  )
  const [reviewStatus, setReviewStatus] =
    useState<AppChangeReviewStatus>('pending')
  const toolTimerRef = useRef<number | null>(null)
  const reviewTimerRef = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (toolTimerRef.current !== null) window.clearTimeout(toolTimerRef.current)
      if (reviewTimerRef.current !== null) {
        window.clearTimeout(reviewTimerRef.current)
      }
    },
    [],
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

  const runStatusDetails: Record<AppAiRunStatus, string> = {
    idle: '',
    thinking: 'The assistant is preparing the request.',
    responding: 'The assistant is writing a response.',
    searching: 'The assistant is searching connected context.',
    'using-tool': 'The file tool is running.',
    'awaiting-approval': 'The assistant is waiting for your decision.',
    'awaiting-review': 'The assistant is waiting for you to review the result.',
    completed: 'The activity is complete.',
    error: 'No file changes were made.',
    canceled: 'No file changes were made.',
  }

  const approveTool = () => {
    if (toolTimerRef.current !== null) window.clearTimeout(toolTimerRef.current)
    setToolStatus('running')
    setRunStatus('using-tool')
    toolTimerRef.current = window.setTimeout(() => {
      toolTimerRef.current = null
      setToolStatus('completed')
      setRunStatus('awaiting-review')
    }, 720)
  }

  const rejectTool = () => {
    if (toolTimerRef.current !== null) {
      window.clearTimeout(toolTimerRef.current)
      toolTimerRef.current = null
    }
    setToolStatus('rejected')
    setRunStatus('canceled')
  }

  const resetWorkflow = () => {
    if (toolTimerRef.current !== null) {
      window.clearTimeout(toolTimerRef.current)
      toolTimerRef.current = null
    }
    setToolStatus('pending')
    if (reviewTimerRef.current !== null) {
      window.clearTimeout(reviewTimerRef.current)
      reviewTimerRef.current = null
    }
    setReviewStatus('pending')
    setRunStatus('awaiting-approval')
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
    setRunStatus('using-tool')
    reviewTimerRef.current = window.setTimeout(() => {
      reviewTimerRef.current = null
      setReviewStatus('applied')
      setRunStatus('completed')
    }, 520)
  }

  const rejectReview = () => {
    if (reviewTimerRef.current !== null) {
      window.clearTimeout(reviewTimerRef.current)
      reviewTimerRef.current = null
    }
    setReviewStatus('rejected')
    setRunStatus('canceled')
  }

  return (
    <DemoPage>
      <DemoSection
        title="Suggestions"
        description="Use AppPromptSuggestions to offer host-defined prompts without coupling the suggestion list to a composer."
      >
        <DemoPreview>
          <AppPromptSuggestions
            items={promptSuggestions}
            onSelect={(item) => setSelectedPrompt(item.prompt)}
          />
          <p className="demo-note">
            {selectedPrompt
              ? `${t('Selected prompt:')} ${selectedPrompt}`
              : t('Choose a suggestion to fill the host-owned composer.')}
          </p>
        </DemoPreview>
      </DemoSection>

      <DemoSection
        title="Run status"
        description="Use AppAiStatus for the current run state while the host keeps the request and tool state."
      >
        <DemoPreview>
          <AppAiStatus
            appearance="card"
            action={
              <AppButton appearance="subtle" onClick={resetWorkflow} size="compact">
                {t('Reset workflow')}
              </AppButton>
            }
            detail={t(runStatusDetails[runStatus])}
            status={runStatus}
            style={{ width: '100%' }}
          />
          <div className="demo-component-row">
            <AppButton onClick={() => setRunStatus('thinking')}>
              {t('Show thinking')}
            </AppButton>
            <AppButton onClick={() => setRunStatus('awaiting-approval')}>
              {t('Show waiting for approval')}
            </AppButton>
            <AppButton onClick={() => setRunStatus('completed')}>
              {t('Show completed')}
            </AppButton>
            <AppButton onClick={() => setRunStatus('error')}>
              {t('Show error')}
            </AppButton>
          </div>
        </DemoPreview>
      </DemoSection>

      <DemoSection
        title="Tool approval: explicit confirmation"
        description="Render AppToolApprovalCard when an operation needs user approval. The host decides whether to run or reject it."
      >
        <DemoPreview>
          <AppToolApprovalCard
            description={t(
              'This writes one new Markdown file. Existing files are not changed.',
            )}
            details={t('Target: Documents/meeting-summary.md')}
            onApprove={approveTool}
            onReject={rejectTool}
            status={toolStatus}
            title={t('Save meeting summary')}
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
            title={t('Review generated file changes')}
          />
          <AppButton onClick={resetWorkflow}>{t('Reset workflow')}</AppButton>
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
