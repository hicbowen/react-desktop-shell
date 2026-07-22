import { forwardRef } from 'react'
import type { AppLinkProps } from './types'
import './AppLink.css'

function ExternalIcon() {
  return <svg aria-hidden="true" viewBox="0 0 16 16"><path d="M9 2h5v5M14 2 8 8M7 3H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V9" /></svg>
}

export const AppLink = forwardRef<HTMLAnchorElement, AppLinkProps>(function AppLink({
  appearance = 'default',
  children,
  className,
  disabled = false,
  external: externalProp,
  externalIcon,
  onClick,
  rel,
  target,
  ...rest
}, ref) {
  const external = externalProp ?? target === '_blank'
  const resolvedTarget = external && target === undefined ? '_blank' : target
  const resolvedRel = resolvedTarget === '_blank' ? rel ?? 'noreferrer noopener' : rel
  return (
    <a
      {...rest}
      aria-disabled={disabled || undefined}
      className={['app-link', `app-link--${appearance}`, disabled ? 'app-link--disabled' : '', className].filter(Boolean).join(' ')}
      onClick={(event) => {
        if (disabled) {
          event.preventDefault()
          return
        }
        onClick?.(event)
      }}
      ref={ref}
      rel={resolvedRel}
      tabIndex={disabled ? -1 : rest.tabIndex}
      target={resolvedTarget}
    >
      <span className="app-link__content">{children}</span>
      {external ? <span className="app-link__external">{externalIcon ?? <ExternalIcon />}</span> : null}
    </a>
  )
})
