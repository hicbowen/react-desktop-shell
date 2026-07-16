import type { AppInfoBarProps, AppInfoBarStatus } from './types'
import { useAppLocale } from '../localization/useAppLocale'
import './AppInfoBar.css'

export function AppInfoBar({
  status = 'info',
  title,
  message,
  icon,
  action,
  dismissible = false,
  onDismiss,
  className,
  children,
}: AppInfoBarProps) {
  const { messages } = useAppLocale()
  const renderedIcon = icon === undefined ? getDefaultIcon(status) : icon
  const classNames = ['app-info-bar', `app-info-bar--${status}`]

  if (className) {
    classNames.push(className)
  }

  const role = status === 'warning' || status === 'error' ? 'alert' : 'status'

  return (
    <div className={classNames.join(' ')} role={role}>
      {renderedIcon ? (
        <div className="app-info-bar__icon" aria-hidden="true">
          {renderedIcon}
        </div>
      ) : null}

      <div className="app-info-bar__content">
        {title ? <div className="app-info-bar__title">{title}</div> : null}
        {message ? (
          <div className="app-info-bar__message">{message}</div>
        ) : null}
        {children ? (
          <div className="app-info-bar__details">{children}</div>
        ) : null}
      </div>

      {action ? <div className="app-info-bar__action">{action}</div> : null}

      {dismissible ? (
        <button
          aria-label={messages.infoBar.dismiss}
          className="app-info-bar__dismiss"
          onClick={onDismiss}
          type="button"
        >
          <svg aria-hidden="true" viewBox="0 0 16 16">
            <path
              d="M4.22 4.22a.75.75 0 0 1 1.06 0L8 6.94l2.72-2.72a.75.75 0 1 1 1.06 1.06L9.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L8 9.06l-2.72 2.72a.75.75 0 0 1-1.06-1.06L6.94 8 4.22 5.28a.75.75 0 0 1 0-1.06Z"
              fill="currentColor"
            />
          </svg>
        </button>
      ) : null}
    </div>
  )
}

function getDefaultIcon(status: AppInfoBarStatus) {
  if (status === 'success') {
    return (
      <svg viewBox="0 0 16 16">
        <path
          d="M8 1.75a6.25 6.25 0 1 0 0 12.5 6.25 6.25 0 0 0 0-12.5Zm3.28 4.53-3.75 3.75a.75.75 0 0 1-1.06 0L4.72 8.28a.75.75 0 1 1 1.06-1.06L7 8.44l3.22-3.22a.75.75 0 1 1 1.06 1.06Z"
          fill="currentColor"
        />
      </svg>
    )
  }

  if (status === 'warning') {
    return (
      <svg viewBox="0 0 16 16">
        <path
          d="M7.15 2.37a.98.98 0 0 1 1.7 0l6.03 10.44a.98.98 0 0 1-.85 1.47H1.97a.98.98 0 0 1-.85-1.47L7.15 2.37ZM8 5a.75.75 0 0 0-.75.75v3a.75.75 0 0 0 1.5 0v-3A.75.75 0 0 0 8 5Zm0 6.75a.88.88 0 1 0 0-1.75.88.88 0 0 0 0 1.75Z"
          fill="currentColor"
        />
      </svg>
    )
  }

  if (status === 'error') {
    return (
      <svg viewBox="0 0 16 16">
        <path
          d="M8 1.75a6.25 6.25 0 1 0 0 12.5 6.25 6.25 0 0 0 0-12.5Zm2.28 7.47a.75.75 0 1 1-1.06 1.06L8 9.06l-1.22 1.22a.75.75 0 1 1-1.06-1.06L6.94 8 5.72 6.78a.75.75 0 0 1 1.06-1.06L8 6.94l1.22-1.22a.75.75 0 1 1 1.06 1.06L9.06 8l1.22 1.22Z"
          fill="currentColor"
        />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 16 16">
      <path
        d="M8 1.75a6.25 6.25 0 1 0 0 12.5 6.25 6.25 0 0 0 0-12.5Zm0 10.5a.75.75 0 0 1-.75-.75V7.75a.75.75 0 0 1 1.5 0v3.75a.75.75 0 0 1-.75.75ZM8 6.25A.88.88 0 1 1 8 4.5a.88.88 0 0 1 0 1.75Z"
        fill="currentColor"
      />
    </svg>
  )
}
