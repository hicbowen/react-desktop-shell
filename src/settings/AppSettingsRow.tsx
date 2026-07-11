import type { AppSettingsRowProps } from './types'
import './AppSettings.css'

export function AppSettingsRow({
  title,
  description,
  icon,
  control,
  disabled = false,
  className,
  style,
}: AppSettingsRowProps) {
  const classNames = ['app-settings-row']
  const hasIcon = icon !== undefined && icon !== null
  const hasDescription = description !== undefined && description !== null
  const hasControl = control !== undefined && control !== null

  if (disabled) {
    classNames.push('app-settings-row--disabled')
  }

  if (hasIcon) {
    classNames.push('app-settings-row--with-icon')
  }

  if (className) {
    classNames.push(className)
  }

  return (
    <div
      aria-disabled={disabled || undefined}
      className={classNames.join(' ')}
      style={style}
    >
      {hasIcon ? (
        <div className="app-settings-row__icon" aria-hidden="true">
          {icon}
        </div>
      ) : null}

      <div className="app-settings-row__content">
        <div className="app-settings-row__title">{title}</div>
        {hasDescription ? (
          <div className="app-settings-row__description">{description}</div>
        ) : null}
      </div>

      {hasControl ? (
        <div className="app-settings-row__control">{control}</div>
      ) : null}
    </div>
  )
}
