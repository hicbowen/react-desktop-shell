import { CheckmarkCircle16Regular } from '@fluentui/react-icons/svg/checkmark-circle'
import { DismissCircle16Regular } from '@fluentui/react-icons/svg/dismiss-circle'
import { ErrorCircle16Regular } from '@fluentui/react-icons/svg/error-circle'
import { Warning16Regular } from '@fluentui/react-icons/svg/warning'
import { AppButton } from '../button'
import { useAppLocale } from '../localization/useAppLocale'
import { AppProgressRing } from '../progress'
import { getAppToolCallStatusLabel } from './toolCallStatus'
import type { AppToolActivityProps, AppToolCallStatus } from './types'
import './AppToolActivity.css'

interface ToolActivityRowProps extends AppToolActivityProps {
  animateRunning?: boolean
  announceStatus?: boolean
}

function ToolStatusIcon({ status }: { status: AppToolCallStatus }) {
  if (status === 'completed') return <CheckmarkCircle16Regular />
  if (status === 'error') return <ErrorCircle16Regular />
  if (status === 'awaiting-approval') return <Warning16Regular />
  if (status === 'rejected' || status === 'canceled') {
    return <DismissCircle16Regular />
  }
  return <span className="app-tool-activity__running-dot" />
}

export function ToolActivityRow({
  animateRunning = true,
  announceStatus = true,
  ariaLabel,
  cancelText,
  className,
  description,
  onCancel,
  status = 'running',
  statusLabel,
  style,
  title,
  ...rest
}: ToolActivityRowProps) {
  const { messages } = useAppLocale()
  const text = messages.ai
  const running = status === 'running'
  const defaultStatusLabel = getAppToolCallStatusLabel(status, text)
  const resolvedStatusLabel = statusLabel ?? defaultStatusLabel
  const showStatusLabel = !running || statusLabel != null
  const accessibleRunningLabel =
    typeof statusLabel === 'string'
      ? statusLabel
      : typeof title === 'string'
        ? title
        : defaultStatusLabel

  return (
    <div
      {...rest}
      aria-busy={running || undefined}
      aria-label={ariaLabel}
      className={[
        'app-tool-activity',
        `app-tool-activity--${status}`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      <span className="app-tool-activity__indicator">
        {running && animateRunning ? (
          <AppProgressRing
            ariaLabel={accessibleRunningLabel}
            labelPosition="hidden"
            size="small"
          />
        ) : (
          <span aria-hidden="true" className="app-tool-activity__status-icon">
            <ToolStatusIcon status={status} />
          </span>
        )}
      </span>
      <span className="app-tool-activity__main">
        <strong className="app-tool-activity__title">{title}</strong>
        {description != null ? (
          <span className="app-tool-activity__description">{description}</span>
        ) : null}
      </span>
      {showStatusLabel || (running && onCancel) ? (
        <span className="app-tool-activity__meta">
          {showStatusLabel ? (
            <span
              aria-live={announceStatus ? 'polite' : undefined}
              className="app-tool-activity__status-label"
            >
              {resolvedStatusLabel}
            </span>
          ) : null}
          {running && onCancel ? (
            <AppButton appearance="subtle" onClick={onCancel} size="compact">
              {cancelText ?? text.cancelTool}
            </AppButton>
          ) : null}
        </span>
      ) : null}
    </div>
  )
}

export function AppToolActivity(props: AppToolActivityProps) {
  return <ToolActivityRow {...props} />
}
