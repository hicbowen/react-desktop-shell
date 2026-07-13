import type { AppCardGroupProps } from './types'
import './AppCard.css'

export function AppCardGroup({
  orientation = 'vertical',
  divided = true,
  className,
  children,
  ...rest
}: AppCardGroupProps) {
  const classNames = [
    'app-card-group',
    `app-card-group--${orientation}`,
  ]

  if (divided) {
    classNames.push('app-card-group--divided')
  }
  if (className) {
    classNames.push(className)
  }

  return (
    <div
      {...rest}
      className={classNames.join(' ')}
      data-divided={divided}
      data-orientation={orientation}
    >
      {children}
    </div>
  )
}
