import { useEffect, useMemo, useRef, useState } from 'react'
import type { AppRailProps, RailItem } from './types'
import './AppRail.css'

const DEFAULT_COLLAPSE_BREAKPOINT = 700

type SelectionDirection = 'up' | 'down' | null

type SelectionTransition = {
  value?: string
  direction: SelectionDirection
}

function getAutoCollapsed(collapseBreakpoint: number) {
  return (
    typeof window !== 'undefined' &&
    window.innerWidth < collapseBreakpoint
  )
}

function getRailItemOrder(items: AppRailProps['items'], footerItems: RailItem[]) {
  return [
    ...items.flatMap((item) => (item.type === 'group' ? [] : [item.key])),
    ...footerItems.map((item) => item.key),
  ]
}

function isRailItem(item: AppRailProps['items'][number]): item is RailItem {
  return item.type !== 'group'
}

function getSelectionDirection(
  previousValue: string | undefined,
  currentValue: string | undefined,
  navigationOrder: string[],
): SelectionDirection {
  if (!previousValue || !currentValue || previousValue === currentValue) {
    return null
  }

  const previousIndex = navigationOrder.indexOf(previousValue)
  const currentIndex = navigationOrder.indexOf(currentValue)

  if (previousIndex === -1 || currentIndex === -1) {
    return null
  }

  if (currentIndex > previousIndex) {
    return 'down'
  }

  if (currentIndex < previousIndex) {
    return 'up'
  }

  return null
}

export function AppRail({
  value,
  footerItems = [],
  items,
  onChange,
  collapsed,
  collapseBreakpoint = DEFAULT_COLLAPSE_BREAKPOINT,
  onCollapsedChange,
  className,
  style,
}: AppRailProps) {
  const isControlled = collapsed !== undefined
  const [autoCollapsed, setAutoCollapsed] = useState(false)
  const isCollapsed = isControlled ? collapsed : autoCollapsed
  const previousCollapsed = useRef(isCollapsed)
  const [selectionTransition, setSelectionTransition] =
    useState<SelectionTransition>({
      value: undefined,
      direction: null,
    })
  const navigationOrder = useMemo(
    () => getRailItemOrder(items, footerItems),
    [footerItems, items],
  )
  const selectionDirection =
    selectionTransition.value === value ? selectionTransition.direction : null

  const handleItemChange = (nextValue: string) => {
    const nextItem = [...items, ...footerItems]
      .filter(isRailItem)
      .find((item) => item.key === nextValue)

    if (nextItem?.disabled) {
      return
    }

    setSelectionTransition({
      value: nextValue,
      direction: getSelectionDirection(value, nextValue, navigationOrder),
    })

    onChange?.(nextValue)
  }

  useEffect(() => {
    if (isControlled || typeof window === 'undefined') {
      return
    }

    const updateCollapsed = () => {
      setAutoCollapsed((current) => {
        const next = getAutoCollapsed(collapseBreakpoint)
        return current === next ? current : next
      })
    }

    updateCollapsed()
    window.addEventListener('resize', updateCollapsed)
    return () => window.removeEventListener('resize', updateCollapsed)
  }, [collapseBreakpoint, isControlled])

  useEffect(() => {
    const previous = previousCollapsed.current
    previousCollapsed.current = isCollapsed

    if (isControlled || previous === isCollapsed) {
      return
    }

    onCollapsedChange?.(isCollapsed)
  }, [isCollapsed, isControlled, onCollapsedChange])

  const rootClassName = useMemo(() => {
    const classes = ['app-rail']

    if (isCollapsed) {
      classes.push('app-rail--collapsed')
    }

    if (className) {
      classes.push(className)
    }

    return classes.join(' ')
  }, [className, isCollapsed])

  const renderItem = (item: RailItem) => {
    const isActive = value === item.key
    const itemClassNames = ['app-rail__item']

    if (isActive) {
      itemClassNames.push('app-rail__item--active')

      if (selectionDirection) {
        itemClassNames.push(
          `app-rail__item--indicator-enter-${selectionDirection}`,
        )
      }
    }

    return (
      <button
        key={item.key}
        className={itemClassNames.join(' ')}
        disabled={item.disabled}
        onClick={() => handleItemChange(item.key)}
        title={isCollapsed ? item.label : undefined}
        type="button"
      >
        {item.icon && <span className="app-rail__icon">{item.icon}</span>}
        {!isCollapsed && <span className="app-rail__label">{item.label}</span>}
      </button>
    )
  }

  return (
    <aside className={rootClassName} style={style}>
      <nav className="app-rail__nav" aria-label="Primary">
        {items.map((item, index) => {
          if (item.type === 'group') {
            if (isCollapsed) {
              return null
            }

            return (
              <div
                key={`group-${index}-${item.label}`}
                className="app-rail__group-title"
              >
                {item.label}
              </div>
            )
          }

          return renderItem(item)
        })}
      </nav>

      {footerItems.length > 0 && (
        <div className="app-rail__footer">{footerItems.map(renderItem)}</div>
      )}
    </aside>
  )
}
