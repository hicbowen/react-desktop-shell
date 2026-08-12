import { useId } from 'react'
import { AppButton } from '../button'
import { useAppLocale } from '../localization/useAppLocale'
import { AppStatusBadge } from '../progress'
import type { AppToolApprovalCardProps, AppToolApprovalStatus } from './types'
import './AppToolApprovalCard.css'

const badgeStatus: Record<
  AppToolApprovalStatus,
  'neutral' | 'info' | 'success' | 'warning' | 'danger'
> = {
  pending: 'warning',
  approved: 'info',
  denied: 'neutral',
  running: 'info',
  completed: 'success',
  error: 'danger',
}

export function AppToolApprovalCard({
  title,
  description,
  details,
  status = 'pending',
  danger = false,
  approveText,
  rejectText,
  onApprove,
  onReject,
  className,
  style,
}: AppToolApprovalCardProps) {
  const { messages } = useAppLocale()
  const text = messages.quickAsk
  const titleId = useId()
  const statusLabels: Record<AppToolApprovalStatus, string> = {
    pending: text.approvalRequired,
    approved: text.approved,
    denied: text.denied,
    running: text.running,
    completed: text.completed,
    error: text.toolFailed,
  }
  const pending = status === 'pending'

  return (
    <section
      aria-labelledby={titleId}
      className={[
        'app-tool-approval-card',
        danger ? 'app-tool-approval-card--danger' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      <div className="app-tool-approval-card__header">
        <strong id={titleId}>{title}</strong>
        <AppStatusBadge
          marker="dot"
          size="small"
          status={danger && pending ? 'danger' : badgeStatus[status]}
        >
          {statusLabels[status]}
        </AppStatusBadge>
      </div>
      {description ? (
        <div className="app-tool-approval-card__description">{description}</div>
      ) : null}
      {details ? (
        <div className="app-tool-approval-card__details">{details}</div>
      ) : null}
      {pending ? (
        <div className="app-tool-approval-card__actions">
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
