import type { AppLocaleMessages } from '../localization/types'
import type { AppToolCallStatus } from './types'

export type AppToolCallBadgeStatus =
  'neutral' | 'info' | 'success' | 'warning' | 'danger'

export function getAppToolCallStatusLabel(
  status: AppToolCallStatus,
  text: AppLocaleMessages['ai'],
) {
  const labels: Record<AppToolCallStatus, string> = {
    'awaiting-approval': text.approvalRequired,
    running: text.running,
    completed: text.completed,
    rejected: text.rejected,
    canceled: text.canceled,
    error: text.toolFailed,
  }
  return labels[status]
}

export function getAppToolCallBadgeStatus(
  status: AppToolCallStatus,
  danger = false,
): AppToolCallBadgeStatus {
  if (status === 'awaiting-approval') return danger ? 'danger' : 'warning'
  if (status === 'running') return 'info'
  if (status === 'completed') return 'success'
  if (status === 'error') return 'danger'
  return 'neutral'
}
