import { useEffect, useMemo, useRef, useState } from 'react'
import type { AppRailProps, RailItem } from './types'
import './AppRail.css'

const DEFAULT_COLLAPSE_BREAKPOINT = 700

function getAutoCollapsed(collapseBreakpoint: number) {
  return (
    typeof window !== 'undefined' &&
    window.innerWidth < collapseBreakpoint
  )
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

  const renderItem = (item: RailItem) => (
    <button
      key={item.key}
      className={`app-rail__item ${
        value === item.key ? 'app-rail__item--active' : ''
      }`}
      onClick={() => onChange?.(item.key)}
      title={isCollapsed ? item.label : undefined}
      type="button"
    >
      {item.icon && <span className="app-rail__icon">{item.icon}</span>}
      {!isCollapsed && <span className="app-rail__label">{item.label}</span>}
    </button>
  )

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
