import { CheckmarkCircle16Regular } from '@fluentui/react-icons/svg/checkmark-circle'
import { Dismiss16Regular } from '@fluentui/react-icons/svg/dismiss'
import { ErrorCircle16Regular } from '@fluentui/react-icons/svg/error-circle'
import { Info16Regular } from '@fluentui/react-icons/svg/info'
import { Warning16Regular } from '@fluentui/react-icons/svg/warning'
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
          <Dismiss16Regular aria-hidden="true" focusable="false" />
        </button>
      ) : null}
    </div>
  )
}

function getDefaultIcon(status: AppInfoBarStatus) {
  if (status === 'success') return <CheckmarkCircle16Regular aria-hidden="true" focusable="false" />
  if (status === 'warning') return <Warning16Regular aria-hidden="true" focusable="false" />
  if (status === 'error') return <ErrorCircle16Regular aria-hidden="true" focusable="false" />
  return <Info16Regular aria-hidden="true" focusable="false" />
}
