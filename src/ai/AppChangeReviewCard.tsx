import { useId, useState } from 'react'
import { AppButton } from '../button'
import { useAppLocale } from '../localization/useAppLocale'
import { AppProgressRing, AppStatusBadge } from '../progress'
import type {
  AppChangeReviewCardProps,
  AppChangeReviewFile,
  AppChangeReviewStatus,
} from './types'
import './AppChangeReviewCard.css'

const badgeStatuses: Record<
  AppChangeReviewStatus,
  'neutral' | 'info' | 'success' | 'warning' | 'danger'
> = {
  'awaiting-review': 'warning',
  applying: 'info',
  applied: 'success',
  rejected: 'neutral',
  error: 'danger',
}

export function AppChangeReviewCard({
  applyText,
  ariaLabel,
  className,
  danger = false,
  defaultExpanded = false,
  description,
  expanded,
  files,
  onApply,
  onExpandedChange,
  onReject,
  rejectText,
  size = 'standard',
  status = 'awaiting-review',
  style,
  title,
  ...rest
}: AppChangeReviewCardProps) {
  const { messages } = useAppLocale()
  const text = messages.changeReview
  const detailsId = useId()
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded)
  const isExpanded = expanded ?? internalExpanded
  const hasDiff = files.some((file) => file.diff != null)
  const canAct = status === 'awaiting-review' || status === 'error'
  const statusLabels: Record<AppChangeReviewStatus, string> = {
    'awaiting-review': text.pending,
    applying: text.applying,
    applied: text.applied,
    rejected: text.rejected,
    error: text.failed,
  }
  const classes = [
    'app-change-review-card',
    `app-change-review-card--${status}`,
    `app-change-review-card--${size}`,
    danger ? 'app-change-review-card--danger' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const toggleExpanded = () => {
    const next = !isExpanded
    if (expanded === undefined) setInternalExpanded(next)
    onExpandedChange?.(next)
  }

  return (
    <section
      {...rest}
      aria-label={ariaLabel ?? (typeof title === 'string' ? title : text.label)}
      className={classes}
      style={style}
    >
      <header className="app-change-review-card__header">
        <div className="app-change-review-card__heading">
          <strong>{title ?? text.label}</strong>
          {description != null ? (
            <span className="app-change-review-card__description">
              {description}
            </span>
          ) : null}
        </div>
        {status === 'applying' ? (
          <AppProgressRing
            ariaLabel={text.applying}
            label={text.applying}
            labelPosition="end"
            size="small"
          />
        ) : (
          <AppStatusBadge
            marker="dot"
            size="small"
            status={badgeStatuses[status]}
          >
            {statusLabels[status]}
          </AppStatusBadge>
        )}
      </header>

      {files.length ? (
        <ul className="app-change-review-card__files">
          {files.map((file) => (
            <ChangeFileRow file={file} key={file.id} />
          ))}
        </ul>
      ) : (
        <div className="app-change-review-card__empty">{text.noChanges}</div>
      )}

      {hasDiff ? (
        <>
          <div className="app-change-review-card__details-toggle">
            <AppButton
              aria-controls={detailsId}
              aria-expanded={isExpanded}
              onClick={toggleExpanded}
              size="compact"
            >
              {isExpanded ? text.hideDetails : text.showDetails}
            </AppButton>
          </div>
          {isExpanded ? (
            <div className="app-change-review-card__diffs" id={detailsId}>
              {files.map((file) =>
                file.diff == null ? null : (
                  <section
                    className="app-change-review-card__diff"
                    key={file.id}
                  >
                    <strong>{file.path}</strong>
                    <div className="app-change-review-card__diff-content">
                      {file.diff}
                    </div>
                  </section>
                ),
              )}
            </div>
          ) : null}
        </>
      ) : null}

      {canAct && (onApply || onReject) ? (
        <div className="app-change-review-card__actions">
          <AppButton disabled={!onReject} onClick={onReject} size="compact">
            {rejectText ?? text.reject}
          </AppButton>
          <AppButton
            appearance={danger ? 'danger' : 'primary'}
            disabled={!onApply}
            onClick={onApply}
            size="compact"
          >
            {applyText ?? text.apply}
          </AppButton>
        </div>
      ) : null}
    </section>
  )
}

function ChangeFileRow({ file }: { file: AppChangeReviewFile }) {
  return (
    <li className="app-change-review-card__file">
      <div className="app-change-review-card__file-main">
        <code className="app-change-review-card__path">{file.path}</code>
        {file.summary != null ? (
          <span className="app-change-review-card__summary">
            {file.summary}
          </span>
        ) : null}
      </div>
      {file.additions !== undefined || file.deletions !== undefined ? (
        <span className="app-change-review-card__counts">
          {file.additions !== undefined ? (
            <span className="app-change-review-card__additions">
              +{file.additions}
            </span>
          ) : null}
          {file.deletions !== undefined ? (
            <span className="app-change-review-card__deletions">
              −{file.deletions}
            </span>
          ) : null}
        </span>
      ) : null}
    </li>
  )
}

export type {
  AppChangeReviewCardProps,
  AppChangeReviewFile,
  AppChangeReviewStatus,
}
