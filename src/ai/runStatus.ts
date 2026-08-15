import type { AppAiRunStatus } from './types'

const busyStatuses: ReadonlySet<AppAiRunStatus> = new Set([
  'thinking',
  'responding',
  'searching',
  'using-tool',
])

const blockedStatuses: ReadonlySet<AppAiRunStatus> = new Set([
  'awaiting-approval',
  'awaiting-review',
])

export function isAppAiRunBusy(status: AppAiRunStatus) {
  return busyStatuses.has(status)
}

export function isAppAiRunBlocked(status: AppAiRunStatus) {
  return blockedStatuses.has(status)
}
