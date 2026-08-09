import {
  Children,
  Fragment,
  isValidElement,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react'
import type {
  AppSelectorPanelProps,
  AppSelectorPanelsProps,
} from './types'
import './AppSelectorPanels.css'

const panelMarker = Symbol.for('react-desktop-shell.AppSelectorPanel')

type SelectionDirection = 'neutral' | 'forward' | 'backward'

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

function getSelectionDirection(
  previousValue: string | undefined,
  currentValue: string | undefined,
  panels: ReactElement<AppSelectorPanelProps>[],
): SelectionDirection {
  if (
    previousValue === undefined ||
    currentValue === undefined ||
    previousValue === currentValue
  ) {
    return 'neutral'
  }

  const previousIndex = panels.findIndex(
    (panel) => panel.props.value === previousValue,
  )
  const currentIndex = panels.findIndex(
    (panel) => panel.props.value === currentValue,
  )

  if (previousIndex === -1 || currentIndex === -1) {
    return 'neutral'
  }

  return currentIndex > previousIndex ? 'forward' : 'backward'
}

function joinClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(' ')
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
      className={joinClassNames('app-selector-panel', className)}
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
  motion = 'entrance',
  children,
  className,
}: AppSelectorPanelsProps) {
  const panels = collectPanels(children)
  const [selectionTransition, setSelectionTransition] = useState<{
    value: string | undefined
    direction: SelectionDirection
  }>(() => ({ value, direction: 'neutral' }))

  if (selectionTransition.value !== value) {
    setSelectionTransition({
      value,
      direction: getSelectionDirection(
        selectionTransition.value,
        value,
        panels,
      ),
    })
  }

  return (
    <div
      className={joinClassNames('app-selector-panels', className)}
      data-direction={selectionTransition.direction}
      data-motion={motion}
    >
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
            className={joinClassNames(
              'app-selector-panel',
              panel.props.className,
            )}
            data-state={active ? 'active' : 'inactive'}
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
