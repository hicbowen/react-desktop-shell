import type { AppStatusBadgeProps } from './types'
import './AppProgress.css'
const statusLabels = { neutral: 'Neutral', info: 'Information', success: 'Success', warning: 'Warning', danger: 'Danger' }
export function AppStatusBadge({ appearance = 'subtle', children, className, icon, size = 'standard', status = 'neutral', statusLabel = statusLabels[status], style }: AppStatusBadgeProps) {
  const classes = ['app-status-badge', `app-status-badge--${status}`, `app-status-badge--${appearance}`, `app-status-badge--${size}`, className].filter(Boolean).join(' ')
  return <span className={classes} style={style}><span className="app-status-badge__marker"><span className="app-status-badge__sr">{statusLabel}: </span>{icon ? <span aria-hidden="true" className="app-status-badge__icon">{icon}</span> : null}</span><span>{children}</span></span>
}
