import { forwardRef } from 'react'
import type { AppButtonProps } from './types'
import './AppButton.css'

function LoadingSpinner() {
  return <span aria-hidden="true" className="app-button__spinner" />
}

export const AppButton = forwardRef<HTMLButtonElement, AppButtonProps>(function AppButton({
  appearance = 'standard',
  block = false,
  children,
  className,
  disabled = false,
  icon,
  iconPosition = 'start',
  loading = false,
  onClick,
  size = 'standard',
  type = 'button',
  ...rest
}, ref) {
  const classes = ['app-button', `app-button--${appearance}`, `app-button--${size}`, block ? 'app-button--block' : '', className].filter(Boolean).join(' ')
  const graphic = icon ? <span className="app-button__icon">{icon}</span> : null

  return <button {...rest} aria-busy={loading || undefined} className={classes} disabled={disabled || loading} onClick={onClick} ref={ref} type={type}>
    <span className="app-button__content">
      {iconPosition === 'start' ? graphic : null}
      <span className="app-button__label">{children}</span>
      {iconPosition === 'end' ? graphic : null}
    </span>
    {loading ? <span className="app-button__loading"><LoadingSpinner /></span> : null}
  </button>
})
