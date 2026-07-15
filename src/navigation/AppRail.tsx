import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
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

const SCROLL_HINT_THRESHOLD = 1

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
  const navRef = useRef<HTMLElement | null>(null)
  const triggerRefs = useRef(new Map<string, HTMLButtonElement>())
  const [canScrollDown, setCanScrollDown] = useState(false)
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
  const flyoutKey = rail.currentFlyout?.key
  const getFlyoutTrigger = useCallback(
    () => (flyoutKey ? (triggerRefs.current.get(flyoutKey) ?? null) : null),
    [flyoutKey],
  )
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

  const updateScrollHint = useCallback(() => {
    const nav = navRef.current

    if (!nav) {
      return
    }

    const nextCanScrollDown =
      nav.scrollTop + nav.clientHeight <
      nav.scrollHeight - SCROLL_HINT_THRESHOLD

    setCanScrollDown((current) =>
      current === nextCanScrollDown ? current : nextCanScrollDown,
    )
  }, [])

  useLayoutEffect(() => {
    const nav = navRef.current

    if (!nav) {
      return
    }

    updateScrollHint()
    window.addEventListener('resize', updateScrollHint)

    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(updateScrollHint)

    resizeObserver?.observe(nav)
    Array.from(nav.children).forEach((child) => resizeObserver?.observe(child))

    return () => {
      window.removeEventListener('resize', updateScrollHint)
      resizeObserver?.disconnect()
    }
  }, [items, rail.expandedKeys, rail.isCollapsed, updateScrollHint])

  return (
    <aside ref={railRef} className={rootClassName} style={style}>
      <div className="app-rail__nav-region">
        <nav
          ref={navRef}
          className={`app-rail__nav app-scrollbar${
            canScrollDown ? ' app-rail__nav--fade-bottom' : ''
          }`}
          aria-label="Primary"
          onScroll={updateScrollHint}
        >
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
                  depth={0}
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
                depth={0}
                collapsed={rail.isCollapsed}
                active={rail.indicatorTarget === item.key}
                selectionDirection={rail.selectionDirection}
                onChange={rail.handleItemChange}
              />
            )
          })}
        </nav>
      </div>

      {footerItems.length > 0 && (
        <div className="app-rail__footer">
          {footerItems.map((item) => (
            <RailItemView
              key={item.key}
              item={item}
              depth={0}
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
          getTrigger={getFlyoutTrigger}
          onChange={rail.handleItemChange}
          onClose={rail.closeFlyout}
          submenu={rail.activeFlyoutSubmenu}
        />
      ) : null}
    </aside>
  )
}
