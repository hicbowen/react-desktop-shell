import { useId, useState } from 'react'
import { AppButton } from '../button'
import { useAppLocale } from '../localization/useAppLocale'
import { AppProgressRing, AppStatusBadge } from '../progress'
import type { AppToolCallCardProps } from './types'
import {
  getAppToolCallBadgeStatus,
  getAppToolCallStatusLabel,
} from './toolCallStatus'
import './AppToolCallCard.css'

export function AppToolCallCard({
  title,
  description,
  details,
  status = 'awaiting-approval',
  statusLabel,
  danger = false,
  approveText,
  rejectText,
  cancelText,
  onApprove,
  onReject,
  onCancel,
  expanded,
  defaultExpanded = false,
  onExpandedChange,
  ariaLabel,
  className,
  style,
  ...rest
}: AppToolCallCardProps) {
  const { messages } = useAppLocale()
  const text = messages.ai
  const titleId = useId()
  const detailsId = useId()
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded)
  const isExpanded = expanded ?? internalExpanded
  const resolvedStatusLabel =
    statusLabel ?? getAppToolCallStatusLabel(status, text)
  const awaitingApproval = status === 'awaiting-approval'
  const running = status === 'running'
  const detailsCollapsible =
    details != null &&
    (status === 'completed' || status === 'rejected' || status === 'canceled')

  const toggleExpanded = () => {
    const next = !isExpanded
    if (expanded === undefined) setInternalExpanded(next)
    onExpandedChange?.(next)
  }

  return (
    <section
      {...rest}
      aria-busy={running || undefined}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabel ? undefined : titleId}
      className={[
        'app-tool-call-card',
        `app-tool-call-card--${status}`,
        danger ? 'app-tool-call-card--danger' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      <div className="app-tool-call-card__header">
        <strong id={titleId}>{title}</strong>
        {running ? (
          <AppProgressRing
            ariaLabel={
              typeof resolvedStatusLabel === 'string'
                ? resolvedStatusLabel
                : text.running
            }
            className="app-tool-call-card__running"
            label={resolvedStatusLabel}
            size="small"
          />
        ) : (
          <AppStatusBadge
            marker="dot"
            size="small"
            status={getAppToolCallBadgeStatus(status, danger)}
          >
            {resolvedStatusLabel}
          </AppStatusBadge>
        )}
      </div>
      {description ? (
        <div className="app-tool-call-card__description">{description}</div>
      ) : null}
      {detailsCollapsible ? (
        <div className="app-tool-call-card__details-toggle">
          <AppButton
            appearance="subtle"
            aria-controls={detailsId}
            aria-expanded={isExpanded}
            onClick={toggleExpanded}
            size="compact"
          >
            {isExpanded ? text.hideToolDetails : text.showToolDetails}
          </AppButton>
        </div>
      ) : null}
      {details != null && (!detailsCollapsible || isExpanded) ? (
        <div className="app-tool-call-card__details" id={detailsId}>
          {details}
        </div>
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
      ) : running && onCancel ? (
        <div className="app-tool-call-card__actions">
          <AppButton appearance="subtle" onClick={onCancel} size="compact">
            {cancelText ?? text.cancelTool}
          </AppButton>
        </div>
      ) : null}
    </section>
  )
}
