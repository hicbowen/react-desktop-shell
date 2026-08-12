import { AppProgressRing, AppStatusBadge } from '../progress'
import { useAppLocale } from '../localization/useAppLocale'
import type {
  AppAiActivityProps,
  AppAiActivityStatus,
  AppAiActivityStep,
  AppAiActivityStepStatus,
} from './types'
import './AppAiActivity.css'

const activeStatuses: ReadonlySet<AppAiActivityStatus> = new Set([
  'thinking',
  'streaming',
  'searching',
  'tool',
])

const badgeStatuses: Record<
  AppAiActivityStatus,
  'neutral' | 'info' | 'success' | 'warning' | 'danger'
> = {
  thinking: 'info',
  streaming: 'info',
  searching: 'info',
  tool: 'info',
  'awaiting-approval': 'warning',
  completed: 'success',
  error: 'danger',
}

function getDefaultLabel(
  status: AppAiActivityStatus,
  text: ReturnType<typeof useAppLocale>['messages']['ai'],
) {
  const labels: Record<AppAiActivityStatus, string> = {
    thinking: text.thinking,
    streaming: text.responding,
    searching: text.searching,
    tool: text.usingTool,
    'awaiting-approval': text.awaitingApproval,
    completed: text.completed,
    error: text.failed,
  }
  return labels[status]
}

function StepMarker({ status }: { status: AppAiActivityStepStatus }) {
  return (
    <span
      aria-hidden="true"
      className={[
        'app-ai-activity__step-marker',
        `app-ai-activity__step-marker--${status}`,
      ].join(' ')}
    />
  )
}

export function AppAiActivity({
  action,
  ariaLabel,
  className,
  detail,
  label,
  size = 'standard',
  status,
  steps,
  style,
  ...rest
}: AppAiActivityProps) {
  const { messages } = useAppLocale()
  const resolvedLabel = label ?? getDefaultLabel(status, messages.ai)
  const isActive = activeStatuses.has(status)
  const classes = [
    'app-ai-activity',
    `app-ai-activity--${status}`,
    `app-ai-activity--${size}`,
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
      style={style}
    >
      <div className="app-ai-activity__header">
        <div className="app-ai-activity__indicator">
          {isActive ? (
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
        {isActive ? <strong>{resolvedLabel}</strong> : null}
        {action ? (
          <div className="app-ai-activity__action">{action}</div>
        ) : null}
      </div>
      {detail != null ? (
        <div className="app-ai-activity__detail">{detail}</div>
      ) : null}
      {steps?.length ? (
        <ol className="app-ai-activity__steps">
          {steps.map((step) => (
            <li
              aria-current={step.status === 'active' ? 'step' : undefined}
              className={`app-ai-activity__step app-ai-activity__step--${step.status}`}
              data-step-id={step.id}
              key={step.id}
            >
              <StepMarker status={step.status} />
              <span className="app-ai-activity__step-copy">
                <span className="app-ai-activity__step-label">
                  {step.label}
                </span>
                {step.detail != null ? (
                  <span className="app-ai-activity__step-detail">
                    {step.detail}
                  </span>
                ) : null}
              </span>
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  )
}

export type {
  AppAiActivityProps,
  AppAiActivityStatus,
  AppAiActivityStep,
  AppAiActivityStepStatus,
}
