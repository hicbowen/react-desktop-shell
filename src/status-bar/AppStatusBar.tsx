import type { AppStatusBarItemProps, AppStatusBarProps } from './types'
import './AppStatusBar.css'

export function AppStatusBar({ ariaLabel = 'Status', center, className, end, start, style }: AppStatusBarProps) {
  return <div aria-label={ariaLabel} className={['app-status-bar', className].filter(Boolean).join(' ')} role="status" style={style}>
    <div className="app-status-bar__region app-status-bar__region--start">{start}</div>
    <div className="app-status-bar__region app-status-bar__region--center">{center}</div>
    <div className="app-status-bar__region app-status-bar__region--end">{end}</div>
  </div>
}

export function AppStatusBarItem({ children, className, icon, interactive = false, type = 'button', ...rest }: AppStatusBarItemProps) {
  if (interactive) return <button {...rest} className={['app-status-bar__item', 'app-status-bar__item--interactive', className].filter(Boolean).join(' ')} type={type}>{icon ? <span className="app-status-bar__icon">{icon}</span> : null}<span>{children}</span></button>
  return <span className={['app-status-bar__item', className].filter(Boolean).join(' ')}>{icon ? <span className="app-status-bar__icon">{icon}</span> : null}<span>{children}</span></span>
}
