import type { AppCardFooterProps } from './types'
import './AppCard.css'

export function AppCardFooter({
  start,
  end,
  children,
  divided = false,
  className,
  ...rest
}: AppCardFooterProps) {
  const hasStart = start !== undefined && start !== null
  const hasEnd = end !== undefined && end !== null
  const hasRegions = hasStart || hasEnd
  const classNames = ['app-card-footer']

  if (divided) {
    classNames.push('app-card-footer--divided')
  }
  if (hasRegions) {
    classNames.push('app-card-footer--regions')
  }
  if (className) {
    classNames.push(className)
  }

  return (
    <div
      {...rest}
      className={classNames.join(' ')}
      data-divided={divided || undefined}
    >
      {hasRegions ? (
        <>
          {hasStart ? (
            <div className="app-card-footer__start">{start}</div>
          ) : null}
          {children !== undefined && children !== null ? (
            <div className="app-card-footer__content">{children}</div>
          ) : null}
          {hasEnd ? <div className="app-card-footer__end">{end}</div> : null}
        </>
      ) : (
        children
      )}
    </div>
  )
}
