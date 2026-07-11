import type { AppToolbarProps } from './types'
import './AppToolbar.css'

export function AppToolbar({
  start,
  status,
  center,
  end,
  children,
  className,
}: AppToolbarProps) {
  const classNames = ['app-toolbar']
  const hasChildren = children !== undefined && children !== null
  const statusContent = status ?? center

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
          {(statusContent !== undefined && statusContent !== null) ||
          (end !== undefined && end !== null) ? (
            <div className="app-toolbar__trailing">
              {statusContent !== undefined && statusContent !== null ? (
                <div className="app-toolbar__status">{statusContent}</div>
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
