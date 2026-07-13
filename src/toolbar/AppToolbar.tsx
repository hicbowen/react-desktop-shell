import type { AppToolbarProps } from './types'
import './AppToolbar.css'

export function AppToolbar({
  appearance = 'surface',
  start,
  status,
  end,
  children,
  className,
}: AppToolbarProps) {
  const classNames = ['app-toolbar', `app-toolbar--${appearance}`]
  const hasChildren = children !== undefined && children !== null

  if (className) {
    classNames.push(className)
  }

  return (
    <div className={classNames.join(' ')}>
      {hasChildren ? (
        children
      ) : (
        <>
          {start !== undefined && start !== null ? (
            <div className="app-toolbar__start">{start}</div>
          ) : null}
          {(status !== undefined && status !== null) ||
          (end !== undefined && end !== null) ? (
            <div className="app-toolbar__trailing">
              {status !== undefined && status !== null ? (
                <div className="app-toolbar__status">{status}</div>
              ) : null}
              {end !== undefined && end !== null ? (
                <div className="app-toolbar__end">{end}</div>
              ) : null}
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
