import { useMemo, useRef } from 'react'
import type { AppRailProps } from './types'
import './AppRail.css'
import '../scroll-area/AppScrollArea.css'
import { RailFlyout } from './RailFlyout'
import { RailItem as RailItemView } from './RailItem'
import { RailSubmenu as RailSubmenuView } from './RailSubmenu'
import {
  isRailGroup,
  isRailSubmenu,
  useRailController,
} from './useRailController'

export function AppRail({
  value,
  footerItems = [],
  items,
  onChange,
  collapsed,
  collapseBreakpoint,
  onCollapsedChange,
  className,
  style,
}: AppRailProps) {
  const railRef = useRef<HTMLElement | null>(null)
  const triggerRefs = useRef(new Map<string, HTMLButtonElement>())
  const rail = useRailController({
    value,
    footerItems,
    items,
    onChange,
    collapsed,
    collapseBreakpoint,
    onCollapsedChange,
    railRef,
    triggerRefs,
  })
  const rootClassName = useMemo(() => {
    const classes = ['app-rail']

    if (rail.isCollapsed) {
      classes.push('app-rail--collapsed')
    }

    if (className) {
      classes.push(className)
    }

    return classes.join(' ')
  }, [className, rail.isCollapsed])

  return (
    <aside ref={railRef} className={rootClassName} style={style}>
      <nav className="app-rail__nav app-scrollbar" aria-label="Primary">
        {items.map((item, index) => {
          if (isRailGroup(item)) {
            if (rail.isCollapsed) {
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

          if (isRailSubmenu(item)) {
            return (
              <RailSubmenuView
                key={item.key}
                item={item}
                collapsed={rail.isCollapsed}
                expanded={rail.expandedKeys.has(item.key)}
                active={rail.indicatorTarget === item.key}
                activeValue={rail.indicatorTarget}
                flyoutOpen={rail.currentFlyout?.key === item.key}
                selectionDirection={rail.selectionDirection}
                triggerRef={(node) => {
                  if (node) {
                    triggerRefs.current.set(item.key, node)
                  } else {
                    triggerRefs.current.delete(item.key)
                  }
                }}
                onToggle={rail.toggleSubmenu}
                onChange={rail.handleItemChange}
              />
            )
          }

          return (
            <RailItemView
              key={item.key}
              item={item}
              collapsed={rail.isCollapsed}
              active={rail.indicatorTarget === item.key}
              selectionDirection={rail.selectionDirection}
              onChange={rail.handleItemChange}
            />
          )
        })}
      </nav>

      {footerItems.length > 0 && (
        <div className="app-rail__footer">
          {footerItems.map((item) => (
            <RailItemView
              key={item.key}
              item={item}
              collapsed={rail.isCollapsed}
              active={rail.indicatorTarget === item.key}
              selectionDirection={rail.selectionDirection}
              onChange={rail.handleItemChange}
            />
          ))}
        </div>
      )}

      {rail.currentFlyout && rail.activeFlyoutSubmenu ? (
        <RailFlyout
          activeValue={value}
          flyout={rail.currentFlyout}
          onChange={rail.handleItemChange}
          onClose={rail.closeFlyout}
          submenu={rail.activeFlyoutSubmenu}
          triggerContains={(target) =>
            triggerRefs.current.get(rail.currentFlyout!.key)?.contains(target) ??
            false
          }
          focusTrigger={() =>
            triggerRefs.current
              .get(rail.currentFlyout!.key)
              ?.focus({ preventScroll: true })
          }
        />
      ) : null}
    </aside>
  )
}
