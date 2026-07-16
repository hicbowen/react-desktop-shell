import type { AppProgressRingProps } from './types'
import './AppProgress.css'
export function AppProgressRing({ ariaLabel, className, label, labelPosition = 'end', size = 'standard', style }: AppProgressRingProps) {
  const accessibleLabel = ariaLabel ?? (typeof label === 'string' ? label : 'Loading')
  const classes = ['app-progress-ring', `app-progress-ring--${size}`, `app-progress-ring--label-${labelPosition}`, className].filter(Boolean).join(' ')
  return <div aria-label={accessibleLabel} className={classes} role="status" style={style}><span aria-hidden="true" className="app-progress-ring__indicator" />{label && labelPosition !== 'hidden' ? <span className="app-progress-ring__label">{label}</span> : null}</div>
}
