import { useId } from 'react'
import type { AppSettingsGroupProps } from './types'
import './AppSettings.css'

export function AppSettingsGroup({
  title,
  description,
  children,
  className,
  style,
}: AppSettingsGroupProps) {
  const titleId = useId()
  const classNames = ['app-settings-group']
  const hasTitle = title !== undefined && title !== null
  const hasDescription = description !== undefined && description !== null

  if (className) {
    classNames.push(className)
  }

  return (
    <section
      aria-labelledby={hasTitle ? titleId : undefined}
      className={classNames.join(' ')}
      style={style}
    >
      {hasTitle || hasDescription ? (
        <header className="app-settings-group__header">
          {hasTitle ? (
            <h2 className="app-settings-group__title" id={titleId}>
              {title}
            </h2>
          ) : null}
          {hasDescription ? (
            <div className="app-settings-group__description">
              {description}
            </div>
          ) : null}
        </header>
      ) : null}

      <div className="app-settings-group__surface">{children}</div>
    </section>
  )
}
