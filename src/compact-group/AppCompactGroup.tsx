import { Children, cloneElement, isValidElement } from 'react'
import type { ReactElement } from 'react'
import type {
  AppCompactGroupProps,
  AppControlAddonProps,
} from './types'
import './AppCompactGroup.css'

type ClassNameElement = ReactElement<{ className?: string }>

export function AppCompactGroup({
  children,
  className,
  direction = 'horizontal',
  fullWidth = false,
  role = 'group',
  ...rest
}: AppCompactGroupProps) {
  const controls = Children.map(children, (child) => {
    if (!isValidElement(child)) return child
    const element = child as ClassNameElement
    return cloneElement(element, {
      className: [
        'app-compact-group__control',
        element.props.className,
      ].filter(Boolean).join(' '),
    })
  })

  return (
    <div
      {...rest}
      className={[
        'app-compact-group',
        `app-compact-group--${direction}`,
        fullWidth ? 'app-compact-group--full-width' : '',
        className ?? '',
      ].filter(Boolean).join(' ')}
      role={role}
    >
      {controls}
    </div>
  )
}

export function AppControlAddon({
  children,
  className,
  size = 'standard',
  ...rest
}: AppControlAddonProps) {
  return (
    <span
      {...rest}
      className={[
        'app-control-addon',
        `app-control-addon--${size}`,
        className ?? '',
      ].filter(Boolean).join(' ')}
    >
      {children}
    </span>
  )
}
