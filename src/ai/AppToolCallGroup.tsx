import { ChevronDown16Regular } from '@fluentui/react-icons/svg/chevron-down'
import { ChevronRight16Regular } from '@fluentui/react-icons/svg/chevron-right'
import { useId, useState } from 'react'
import { AppIconButton } from '../button'
import { useAppLocale } from '../localization/useAppLocale'
import { AppProgressRing, AppStatusBadge } from '../progress'
import { ToolActivityRow } from './AppToolActivity'
import { getAppToolCallBadgeStatus } from './toolCallStatus'
import type {
  AppToolCallGroupItem,
  AppToolCallGroupProps,
  AppToolCallStatus,
} from './types'
import './AppToolCallGroup.css'

function getGroupStatus(
  items: readonly AppToolCallGroupItem[],
): AppToolCallStatus | null {
  if (!items.length) return null
  if (items.some((item) => item.status === 'awaiting-approval')) {
    return 'awaiting-approval'
  }
  if (items.some((item) => item.status === 'running')) return 'running'
  if (items.some((item) => item.status === 'error')) return 'error'
  if (items.every((item) => item.status === 'completed')) return 'completed'
  if (items.some((item) => item.status === 'canceled')) return 'canceled'
  return 'rejected'
}

export function AppToolCallGroup({
  ariaLabel,
  cancelText,
  className,
  defaultExpanded = true,
  description,
  expanded,
  items,
  onCancel,
  onExpandedChange,
  statusLabel,
  style,
  title,
  ...rest
}: AppToolCallGroupProps) {
  const { messages } = useAppLocale()
  const text = messages.ai
  const titleId = useId()
  const listId = useId()
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded)
  const isExpanded = expanded ?? internalExpanded
  const status = getGroupStatus(items)
  const completedCount = items.filter(
    (item) => item.status === 'completed',
  ).length
  const runningCount = items.filter((item) => item.status === 'running').length
  const approvalCount = items.filter(
    (item) => item.status === 'awaiting-approval',
  ).length
  const failureCount = items.filter((item) => item.status === 'error').length

  const getDefaultStatusLabel = () => {
    if (status === null) return text.noToolActivity
    if (status === 'running') {
      return text.toolProgress(completedCount, items.length)
    }
    if (status === 'awaiting-approval') {
      return text.toolApprovalCount(approvalCount)
    }
    if (status === 'error') return text.toolFailureCount(failureCount)
    if (status === 'completed') return text.toolCompletedCount(items.length)
    if (completedCount > 0) {
      return text.toolProgress(completedCount, items.length)
    }
    return status === 'canceled' ? text.canceled : text.rejected
  }

  const defaultStatusLabel = getDefaultStatusLabel()
  const resolvedStatusLabel = statusLabel ?? defaultStatusLabel
  const toggleExpanded = () => {
    const next = !isExpanded
    if (expanded === undefined) setInternalExpanded(next)
    onExpandedChange?.(next)
  }

  return (
    <section
      {...rest}
      aria-busy={runningCount > 0 || undefined}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabel ? undefined : titleId}
      className={[
        'app-tool-call-group',
        status ? `app-tool-call-group--${status}` : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      <header className="app-tool-call-group__header">
        <span className="app-tool-call-group__heading">
          <strong id={titleId}>{title ?? text.toolActivity}</strong>
          {description != null ? <span>{description}</span> : null}
        </span>
        <span className="app-tool-call-group__summary">
          {status === 'running' ? (
            <AppProgressRing
              ariaLabel={
                typeof resolvedStatusLabel === 'string'
                  ? resolvedStatusLabel
                  : defaultStatusLabel
              }
              label={resolvedStatusLabel}
              size="small"
            />
          ) : status === null ? (
            <span className="app-tool-call-group__empty">
              {resolvedStatusLabel}
            </span>
          ) : (
            <AppStatusBadge
              marker="dot"
              size="small"
              status={getAppToolCallBadgeStatus(status)}
            >
              {resolvedStatusLabel}
            </AppStatusBadge>
          )}
        </span>
        {items.length ? (
          <AppIconButton
            appearance="subtle"
            aria-controls={listId}
            aria-expanded={isExpanded}
            ariaLabel={
              isExpanded ? text.collapseToolActivity : text.expandToolActivity
            }
            icon={
              isExpanded ? <ChevronDown16Regular /> : <ChevronRight16Regular />
            }
            onClick={toggleExpanded}
            shape="circular"
            size="compact"
          />
        ) : null}
      </header>
      {items.length && isExpanded ? (
        <ul className="app-tool-call-group__list" id={listId}>
          {items.map((item) => (
            <li className="app-tool-call-group__item" key={item.id}>
              <ToolActivityRow
                animateRunning={false}
                announceStatus={false}
                ariaLabel={item.ariaLabel}
                cancelText={cancelText}
                className="app-tool-call-group__activity"
                description={item.description}
                onCancel={
                  onCancel && item.status === 'running'
                    ? () => onCancel(item)
                    : undefined
                }
                status={item.status}
                statusLabel={item.statusLabel}
                title={item.title}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
