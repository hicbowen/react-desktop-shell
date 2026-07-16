import { useId } from 'react'
import type { AppProgressBarProps } from './types'
import './AppProgress.css'
const finite = (value: number | undefined, fallback: number) => typeof value === 'number' && Number.isFinite(value) ? value : fallback
export function AppProgressBar({ className, description, formatValue, indeterminate = false, label, max = 100, showValue = false, status = 'normal', style, value = 0 }: AppProgressBarProps) {
  const id = useId(); const safeMax = Math.max(0.000001, finite(max, 100)); const safeValue = Math.min(safeMax, Math.max(0, finite(value, 0))); const percent = safeValue / safeMax * 100
  const valueText = formatValue ? formatValue(safeValue, safeMax) : `${Math.round(percent)}%`
  const classes = ['app-progress-bar', `app-progress-bar--${status}`, indeterminate ? 'app-progress-bar--indeterminate' : '', className].filter(Boolean).join(' ')
  return <div className={classes} style={style}>{label || showValue ? <div className="app-progress-bar__header">{label ? <span id={`${id}-label`}>{label}</span> : <span />}{showValue ? <span className="app-progress-bar__value">{valueText}</span> : null}</div> : null}<div aria-labelledby={label ? `${id}-label` : undefined} aria-valuemax={indeterminate ? undefined : safeMax} aria-valuemin={indeterminate ? undefined : 0} aria-valuenow={indeterminate ? undefined : safeValue} aria-valuetext={indeterminate ? undefined : typeof valueText === 'string' ? valueText : undefined} className="app-progress-bar__track" role="progressbar"><span className="app-progress-bar__indicator" style={indeterminate ? undefined : { width: `${percent}%` }} /></div>{description ? <div className="app-progress-bar__description">{description}</div> : null}</div>
}
