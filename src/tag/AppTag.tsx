import { Dismiss16Regular } from '@fluentui/react-icons/svg/dismiss'
import { useAppLocale } from '../localization/useAppLocale'
import type { AppTagProps } from './types'
import './AppTag.css'

export function AppTag({
  appearance = 'subtle',
  children,
  className,
  color = 'neutral',
  disabled = false,
  dismissLabel,
  icon,
  onDismiss,
  shape = 'rounded',
  size = 'standard',
  style,
}: AppTagProps) {
  const { messages } = useAppLocale()
  const classes = [
    'app-tag',
    `app-tag--${color}`,
    `app-tag--${appearance}`,
    `app-tag--${size}`,
    `app-tag--${shape}`,
    disabled ? 'app-tag--disabled' : '',
    className,
  ].filter(Boolean).join(' ')

  return <span aria-disabled={disabled || undefined} className={classes} style={style}>
    {icon ? <span aria-hidden="true" className="app-tag__icon">{icon}</span> : null}
    <span className="app-tag__content">{children}</span>
    {onDismiss ? <button aria-label={dismissLabel ?? messages.tag.dismiss} className="app-tag__dismiss" disabled={disabled} onClick={onDismiss} type="button">
      <Dismiss16Regular aria-hidden="true" focusable="false" />
    </button> : null}
  </span>
}
