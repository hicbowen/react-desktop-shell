import type { AppCardHeaderProps } from './types'
import './AppCard.css'

export function AppCardHeader({
  icon,
  image,
  title,
  description,
  action,
  className,
  ...rest
}: AppCardHeaderProps) {
  const hasImage = image !== undefined && image !== null
  const hasIcon = icon !== undefined && icon !== null
  const hasDescription = description !== undefined && description !== null
  const hasAction = action !== undefined && action !== null
  const classNames = ['app-card-header']

  if (className) {
    classNames.push(className)
  }

  return (
    <div {...rest} className={classNames.join(' ')}>
      {hasImage ? (
        <div className="app-card-header__leading app-card-header__image">
          {image}
        </div>
      ) : hasIcon ? (
        <div
          aria-hidden="true"
          className="app-card-header__leading app-card-header__icon"
        >
          {icon}
        </div>
      ) : null}

      <div className="app-card-header__text">
        <div className="app-card-header__title">{title}</div>
        {hasDescription ? (
          <div className="app-card-header__description">{description}</div>
        ) : null}
      </div>

      {hasAction ? (
        <div className="app-card-header__action">{action}</div>
      ) : null}
    </div>
  )
}
