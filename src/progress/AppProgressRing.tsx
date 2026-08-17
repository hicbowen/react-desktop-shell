import type { AppProgressRingProps } from './types'
import { useAppLocale } from '../localization/useAppLocale'
import './AppProgress.css'

export function AppProgressRing({
  ariaHidden = false,
  ariaLabel,
  className,
  label,
  labelPosition = 'end',
  size = 'standard',
  style,
}: AppProgressRingProps) {
  const { messages } = useAppLocale()
  const accessibleLabel =
    ariaLabel ?? (typeof label === 'string' ? label : messages.common.loading)
  const classes = [
    'app-progress-ring',
    `app-progress-ring--${size}`,
    `app-progress-ring--label-${labelPosition}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      aria-hidden={ariaHidden || undefined}
      aria-label={ariaHidden ? undefined : accessibleLabel}
      className={classes}
      role={ariaHidden ? undefined : 'status'}
      style={style}
    >
      <span aria-hidden="true" className="app-progress-ring__indicator" />
      {label && labelPosition !== 'hidden' ? (
        <span className="app-progress-ring__label">{label}</span>
      ) : null}
    </div>
  )
}
