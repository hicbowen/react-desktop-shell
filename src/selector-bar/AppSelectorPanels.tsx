import {
  Children,
  Fragment,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react'
import type {
  AppSelectorPanelProps,
  AppSelectorPanelsProps,
} from './types'

const panelMarker = Symbol.for('react-desktop-shell.AppSelectorPanel')

function hasPanelMarker(type: unknown) {
  return (
    (typeof type === 'function' ||
      (typeof type === 'object' && type !== null)) &&
    (type as Record<PropertyKey, unknown>)[panelMarker] === true
  )
}

function isSelectorPanel(
  child: ReactNode,
): child is ReactElement<AppSelectorPanelProps> {
  return isValidElement(child) && hasPanelMarker(child.type)
}

function collectPanels(children: ReactNode): ReactElement<AppSelectorPanelProps>[] {
  return Children.toArray(children).flatMap((child) => {
    if (isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment) {
      return collectPanels(child.props.children)
    }

    return isSelectorPanel(child) ? [child] : []
  })
}

export function AppSelectorPanel({
  children,
  id,
  labelledBy,
  className,
}: AppSelectorPanelProps) {
  return (
    <div
      aria-labelledby={labelledBy}
      className={className}
      id={id}
      role="region"
    >
      {children}
    </div>
  )
}

;(AppSelectorPanel as unknown as Record<PropertyKey, unknown>)[panelMarker] = true

export function AppSelectorPanels({
  value,
  mountStrategy = 'unmount',
  children,
  className,
}: AppSelectorPanelsProps) {
  const panels = collectPanels(children)

  return (
    <div className={className}>
      {panels.flatMap((panel) => {
        const active = panel.props.value === value

        if (mountStrategy === 'unmount' && !active) {
          return []
        }

        return [
          <div
            aria-hidden={
              mountStrategy === 'hidden' && !active ? true : undefined
            }
            aria-labelledby={panel.props.labelledBy}
            className={panel.props.className}
            hidden={mountStrategy === 'hidden' && !active}
            id={panel.props.id}
            key={panel.key ?? panel.props.value}
            role="region"
          >
            {panel.props.children}
          </div>,
        ]
      })}
    </div>
  )
}
