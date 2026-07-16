import { forwardRef } from 'react'
import type { AppIconButtonProps } from './types'
import './AppButton.css'

export const AppIconButton = forwardRef<HTMLButtonElement, AppIconButtonProps>(function AppIconButton({
  appearance = 'standard',
  ariaLabel,
  'aria-label': nativeAriaLabel,
  className,
  disabled = false,
  icon,
  loading = false,
  shape = 'rounded',
  size = 'standard',
  type = 'button',
  ...rest
}, ref) {
  const label = nativeAriaLabel ?? ariaLabel
  if (import.meta.env.DEV && !label && !rest['aria-labelledby']) console.warn('AppIconButton requires ariaLabel, aria-label, or aria-labelledby.')
  const classes = ['app-button', 'app-icon-button', `app-button--${appearance}`, `app-button--${size}`, `app-icon-button--${shape}`, className].filter(Boolean).join(' ')
  return <button {...rest} aria-busy={loading || undefined} aria-label={label} className={classes} disabled={disabled || loading} ref={ref} type={type}>
    <span aria-hidden="true" className="app-icon-button__graphic">{icon}</span>
    {loading ? <span aria-hidden="true" className="app-button__spinner app-icon-button__spinner" /> : null}
  </button>
})
