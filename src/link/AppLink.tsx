import { forwardRef } from 'react'
import { Open16Regular } from '@fluentui/react-icons/svg/open'
import type { AppLinkProps } from './types'
import './AppLink.css'

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
      {external ? <span className="app-link__external">{externalIcon ?? <Open16Regular aria-hidden="true" focusable="false" />}</span> : null}
    </a>
  )
})
