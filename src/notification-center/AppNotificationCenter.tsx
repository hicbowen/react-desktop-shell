import { useAppLocale } from '../localization/useAppLocale'
import type { AppNotificationCenterProps, AppNotificationIndicatorProps, AppNotificationStatus } from './types'
import './AppNotificationCenter.css'

function StatusIcon({ status }: { status: AppNotificationStatus }) {
  if (status === 'success') return <path d="m3 8 3 3 7-7" />
  if (status === 'warning') return <><path d="M8 2 2 14h12L8 2Z" /><path d="M8 6v4M8 12v.1" /></>
  if (status === 'error') return <><circle cx="8" cy="8" r="6" /><path d="m6 6 4 4m0-4-4 4" /></>
  return <><circle cx="8" cy="8" r="6" /><path d="M8 7v4M8 5v.1" /></>
}

export function AppNotificationIndicator({ ariaLabel, className, max = 99, notifications }: AppNotificationIndicatorProps) {
  const { messages } = useAppLocale()
  const unread = notifications.filter((notification) => !notification.read).length
  const resolvedMax = Math.max(1, Math.floor(max))
  const display = unread > resolvedMax ? `${resolvedMax}+` : String(unread)
  return <span aria-label={ariaLabel ?? messages.notificationCenter.unread(unread)} className={['app-notification-indicator', unread ? 'app-notification-indicator--active' : '', className].filter(Boolean).join(' ')}>{unread ? display : null}</span>
}

export function AppNotificationCenter({
  ariaLabel,
  className,
  emptyContent,
  notifications,
  onAction,
  onClearAll,
  onDismiss,
  onInvoke,
  onMarkAllRead,
  onMarkRead,
  style,
}: AppNotificationCenterProps) {
  const { messages } = useAppLocale()
  const text = messages.notificationCenter
  const hasUnread = notifications.some((notification) => !notification.read)
  return (
    <section aria-label={ariaLabel ?? text.label} className={['app-notification-center', className].filter(Boolean).join(' ')} style={style}>
      <header className="app-notification-center__header">
        <strong>{text.label}</strong>
        <span className="app-notification-center__header-actions">
          {hasUnread && onMarkAllRead ? <button onClick={onMarkAllRead} type="button">{text.markAllRead}</button> : null}
          {notifications.length > 0 && onClearAll ? <button onClick={onClearAll} type="button">{text.clearAll}</button> : null}
        </span>
      </header>
      <div className="app-notification-center__list">
        {notifications.length ? notifications.map((notification) => {
          const status = notification.status ?? 'neutral'
          const mainContent = <><span className={`app-notification-center__icon app-notification-center__icon--${status}`}>{notification.icon ?? <svg aria-hidden="true" viewBox="0 0 16 16"><StatusIcon status={status} /></svg>}</span><span className="app-notification-center__content"><span className="app-notification-center__title">{notification.title}</span>{notification.body ? <span className="app-notification-center__body">{notification.body}</span> : null}{notification.timestamp ? <time className="app-notification-center__time">{notification.timestamp}</time> : null}</span></>
          return (
            <article className={['app-notification-center__item', notification.read ? '' : 'app-notification-center__item--unread'].filter(Boolean).join(' ')} key={notification.id}>
              {onInvoke ? <button aria-label={typeof notification.title === 'string' ? notification.title : undefined} className="app-notification-center__main" onClick={() => onInvoke(notification.id)} type="button">{mainContent}</button> : <div className="app-notification-center__main">{mainContent}</div>}
              <div className="app-notification-center__controls">
                {notification.actions?.map((action) => <button className={action.primary ? 'app-notification-center__action--primary' : undefined} disabled={action.disabled || !onAction} key={action.key} onClick={() => onAction?.(notification.id, action.key)} type="button">{action.label}</button>)}
                {onMarkRead ? <button aria-label={notification.read ? text.markUnread : text.markRead} onClick={() => onMarkRead(notification.id, !notification.read)} type="button">{notification.read ? '○' : '●'}</button> : null}
                {notification.dismissible !== false && onDismiss ? <button aria-label={text.dismiss} onClick={() => onDismiss(notification.id)} type="button">×</button> : null}
              </div>
            </article>
          )
        }) : <div className="app-notification-center__empty">{emptyContent ?? text.empty}</div>}
      </div>
    </section>
  )
}
