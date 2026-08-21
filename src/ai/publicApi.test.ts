import { describe, expect, it } from 'vitest'
import type {
  // @ts-expect-error AppAiRequestStatus was replaced by AppAiRunStatus.
  AppAiRequestStatus,
  AppAiComposerProps,
  AppAiRunStatus,
  AppChangeReviewStatus,
  AppQuickAskProps,
  // @ts-expect-error AppToolApprovalStatus was replaced by AppToolCallStatus.
  AppToolApprovalStatus,
  AppToolCallStatus,
} from '../index'

type PublicValueExports = typeof import('../index')
type RemovedAiValueExport = Extract<
  'AppAiActivity' | 'AppToolApprovalCard',
  keyof PublicValueExports
>

const removedAiValueExportsPresent:
  [RemovedAiValueExport] extends [never] ? false : true = false

const runStatuses: AppAiRunStatus[] = [
  'idle',
  'thinking',
  'responding',
  'searching',
  'using-tool',
  'awaiting-approval',
  'awaiting-review',
  'completed',
  'error',
  'canceled',
]

const composerProps: AppAiComposerProps = {
  onSubmit: () => undefined,
  runStatus: 'responding',
}

const quickAskProps: AppQuickAskProps = {
  onOpenChange: () => undefined,
  onSubmit: () => undefined,
  open: true,
  runStatus: 'thinking',
}

const removedComposerStatusProp: AppAiComposerProps = {
  onSubmit: () => undefined,
  // @ts-expect-error Request state moved to runStatus.
  status: 'streaming',
}

const removedQuickAskStatusProp: AppQuickAskProps = {
  onOpenChange: () => undefined,
  onSubmit: () => undefined,
  open: true,
  // @ts-expect-error Request state moved to runStatus.
  status: 'submitting',
}

// @ts-expect-error Streaming was replaced by the responding run state.
const removedRunStatus: AppAiRunStatus = 'streaming'
// @ts-expect-error Pending approval has an explicit lifecycle name.
const removedToolStatus: AppToolCallStatus = 'pending'
// @ts-expect-error Pending review has an explicit lifecycle name.
const removedReviewStatus: AppChangeReviewStatus = 'pending'
const removedRequestStatusType: AppAiRequestStatus = 'streaming'
const removedApprovalStatusType: AppToolApprovalStatus = 'pending'

describe('public AI API', () => {
  it('exposes only the run-oriented lifecycle contract', () => {
    expect(removedAiValueExportsPresent).toBe(false)
    expect(runStatuses).toHaveLength(10)
    expect(composerProps.runStatus).toBe('responding')
    expect(quickAskProps.runStatus).toBe('thinking')
    expect([
      removedComposerStatusProp,
      removedQuickAskStatusProp,
      removedRunStatus,
      removedToolStatus,
      removedReviewStatus,
      removedRequestStatusType,
      removedApprovalStatusType,
    ]).toHaveLength(7)
  })
})
