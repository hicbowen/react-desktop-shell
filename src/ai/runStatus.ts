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

const composerBusyStatuses: ReadonlySet<AppAiRunStatus> = new Set([
  'thinking',
  'responding',
  'searching',
])

export function isAppAiRunBusy(status: AppAiRunStatus) {
  return busyStatuses.has(status)
}

export function isAppAiRunBlocked(status: AppAiRunStatus) {
  return blockedStatuses.has(status)
}

/**
 * Composer-owned generation only. Tool execution and approval belong in the
 * message stream, so they must not turn the composer into a hidden stop or
 * blocked state.
 */
export function isAppAiComposerBusy(status: AppAiRunStatus) {
  return composerBusyStatuses.has(status)
}
