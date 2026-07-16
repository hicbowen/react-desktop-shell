import type { AppEmptyStateProps } from './types'
import './AppEmptyState.css'

export function AppEmptyState({ action, align = 'center', appearance = 'regular', className, description, icon, style, title }: AppEmptyStateProps) {
  const classes = ['app-empty-state', `app-empty-state--${appearance}`, `app-empty-state--${align}`, className].filter(Boolean).join(' ')
  return <section className={classes} style={style}>{icon ? <div aria-hidden="true" className="app-empty-state__icon">{icon}</div> : null}<div className="app-empty-state__title">{title}</div>{description ? <div className="app-empty-state__description">{description}</div> : null}{action ? <div className="app-empty-state__action">{action}</div> : null}</section>
}
