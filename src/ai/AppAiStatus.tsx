import { AppProgressRing, AppStatusBadge } from '../progress'
import { useAppLocale } from '../localization/useAppLocale'
import { isAppAiRunBusy } from './runStatus'
import type { AppAiRunStatus, AppAiStatusProps } from './types'
import './AppAiStatus.css'

const badgeStatuses: Record<
  AppAiRunStatus,
  'neutral' | 'info' | 'success' | 'warning' | 'danger'
> = {
  idle: 'neutral',
  thinking: 'info',
  responding: 'info',
  searching: 'info',
  'using-tool': 'info',
  'awaiting-approval': 'warning',
  'awaiting-review': 'warning',
  completed: 'success',
  error: 'danger',
  canceled: 'neutral',
}

function getDefaultLabel(
  status: AppAiRunStatus,
  text: ReturnType<typeof useAppLocale>['messages']['ai'],
) {
  const labels: Record<AppAiRunStatus, string> = {
    idle: text.response,
    thinking: text.thinking,
    responding: text.responding,
    searching: text.searching,
    'using-tool': text.usingTool,
    'awaiting-approval': text.awaitingApproval,
    'awaiting-review': text.awaitingReview,
    completed: text.completed,
    error: text.failed,
    canceled: text.canceled,
  }
  return labels[status]
}

export function AppAiStatus({
  action,
  ariaLabel,
  appearance = 'inline',
  className,
  detail,
  label,
  status,
  style,
  ...rest
}: AppAiStatusProps) {
  const { messages } = useAppLocale()
  if (status === 'idle') return null

  const resolvedLabel = label ?? getDefaultLabel(status, messages.ai)
  const busy = isAppAiRunBusy(status)
  const classes = [
    'app-ai-status',
    `app-ai-status--${status}`,
    `app-ai-status--${appearance}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section
      {...rest}
      aria-label={
        ariaLabel ??
        (typeof resolvedLabel === 'string' ? resolvedLabel : undefined)
      }
      aria-live="polite"
      className={classes}
      role="status"
      style={style}
    >
      <div className="app-ai-status__header">
        <div className="app-ai-status__indicator">
          {busy ? (
            <AppProgressRing
              ariaLabel={
                typeof resolvedLabel === 'string'
                  ? resolvedLabel
                  : messages.common.loading
              }
              labelPosition="hidden"
              size="small"
            />
          ) : (
            <AppStatusBadge
              marker="dot"
              size="small"
              status={badgeStatuses[status]}
            >
              {resolvedLabel}
            </AppStatusBadge>
          )}
        </div>
        {busy ? <strong>{resolvedLabel}</strong> : null}
        {action ? <div className="app-ai-status__action">{action}</div> : null}
      </div>
      {detail != null ? (
        <div className="app-ai-status__detail">{detail}</div>
      ) : null}
    </section>
  )
}

export type { AppAiRunStatus, AppAiStatusProps }
