import { useId } from 'react'
import { AppButton } from '../button'
import { useAppLocale } from '../localization/useAppLocale'
import { AppStatusBadge } from '../progress'
import type { AppToolCallCardProps, AppToolCallStatus } from './types'
import './AppToolCallCard.css'

const badgeStatus: Record<
  AppToolCallStatus,
  'neutral' | 'info' | 'success' | 'warning' | 'danger'
> = {
  'awaiting-approval': 'warning',
  rejected: 'neutral',
  running: 'info',
  completed: 'success',
  error: 'danger',
}

export function AppToolCallCard({
  title,
  description,
  details,
  status = 'awaiting-approval',
  danger = false,
  approveText,
  rejectText,
  onApprove,
  onReject,
  className,
  style,
}: AppToolCallCardProps) {
  const { messages } = useAppLocale()
  const text = messages.ai
  const titleId = useId()
  const statusLabels: Record<AppToolCallStatus, string> = {
    'awaiting-approval': text.approvalRequired,
    rejected: text.rejected,
    running: text.running,
    completed: text.completed,
    error: text.toolFailed,
  }
  const awaitingApproval = status === 'awaiting-approval'

  return (
    <section
      aria-labelledby={titleId}
      className={[
        'app-tool-call-card',
        danger ? 'app-tool-call-card--danger' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      <div className="app-tool-call-card__header">
        <strong id={titleId}>{title}</strong>
        <AppStatusBadge
          marker="dot"
          size="small"
          status={danger && awaitingApproval ? 'danger' : badgeStatus[status]}
        >
          {statusLabels[status]}
        </AppStatusBadge>
      </div>
      {description ? (
        <div className="app-tool-call-card__description">{description}</div>
      ) : null}
      {details ? (
        <div className="app-tool-call-card__details">{details}</div>
      ) : null}
      {awaitingApproval ? (
        <div className="app-tool-call-card__actions">
          <AppButton disabled={!onReject} onClick={onReject} size="compact">
            {rejectText ?? text.reject}
          </AppButton>
          <AppButton
            appearance={danger ? 'danger' : 'primary'}
            disabled={!onApprove}
            onClick={onApprove}
            size="compact"
          >
            {approveText ?? text.approveOnce}
          </AppButton>
        </div>
      ) : null}
    </section>
  )
}
