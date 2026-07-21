import type { AppStatusBadgeProps } from './types'
import { useAppLocale } from '../localization/useAppLocale'
import './AppProgress.css'
export function AppStatusBadge({ appearance = 'subtle', children, className, icon, marker = 'none', size = 'standard', status = 'neutral', style }: AppStatusBadgeProps) {
  const { messages } = useAppLocale()
  const classes = ['app-status-badge', `app-status-badge--${status}`, `app-status-badge--${appearance}`, `app-status-badge--${size}`, className].filter(Boolean).join(' ')
  const visualMarker = icon ? <span className="app-status-badge__icon">{icon}</span> : marker === 'dot' ? <span className="app-status-badge__dot" /> : null
  return <span className={classes} style={style}><span className="app-status-badge__sr">{messages.statusBadge[status]}: </span>{visualMarker ? <span aria-hidden="true" className="app-status-badge__marker">{visualMarker}</span> : null}<span>{children}</span></span>
}
