import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import type {
  AppRailProps,
  RailEntry,
  RailItem,
  RailLinkItem,
  RailSubmenu,
} from './types'
import './AppRail.css'

const DEFAULT_COLLAPSE_BREAKPOINT = 700
const FLYOUT_GAP = 6
const FLYOUT_MARGIN = 8

type SelectionDirection = 'up' | 'down' | null

type SelectionTransition = {
  target?: string
  direction: SelectionDirection
}

type ExpandedState = {
  value?: string
  keys: Set<string>
}

type FlyoutState = {
  key: string
  rect: DOMRect
  value?: string
  themeStyle: CSSProperties
} | null

type FlyoutPosition = {
  left: number
  top: number
  visible: boolean
}

function getAutoCollapsed(collapseBreakpoint: number) {
  return (
    typeof window !== 'undefined' &&
    window.innerWidth < collapseBreakpoint
  )
}

function isRailGroup(item: RailEntry): item is Extract<RailEntry, { type: 'group' }> {
  return item.type === 'group'
}

function isRailSubmenu(item: RailEntry): item is RailSubmenu {
  return item.type === 'submenu'
}

function isRailLinkItem(item: RailEntry): item is RailLinkItem {
  return !isRailGroup(item) && !isRailSubmenu(item)
}

function findParentSubmenuKey(items: RailEntry[], value: string | undefined) {
  if (!value) {
    return undefined
  }

  for (const item of items) {
    if (
      isRailSubmenu(item) &&
      item.children.some((child) => child.key === value)
    ) {
      return item.key
    }
  }

  return undefined
}

function findSubmenu(
  items: RailEntry[],
  key: string | undefined,
): RailSubmenu | undefined {
  if (!key) {
    return undefined
  }

  for (const item of items) {
    if (isRailSubmenu(item) && item.key === key) {
      return item
    }
  }

  return undefined
}

function findLinkItem(
  items: RailEntry[],
  footerItems: RailItem[],
  key: string,
) {
  for (const item of items) {
    if (isRailLinkItem(item) && item.key === key) {
      return item
    }

    if (isRailSubmenu(item)) {
      const child = item.children.find((entry) => entry.key === key)

      if (child) {
        return child
      }
    }
  }

  return footerItems.find((item) => item.key === key)
}

function getVisibleNavigationOrder(
  items: RailEntry[],
  footerItems: RailItem[],
  expandedKeys: Set<string>,
  collapsed: boolean,
) {
  const order: string[] = []

  for (const item of items) {
    if (isRailGroup(item)) {
      continue
    }

    order.push(item.key)

    if (!collapsed && isRailSubmenu(item) && expandedKeys.has(item.key)) {
      order.push(...item.children.map((child) => child.key))
    }
  }

  order.push(...footerItems.map((item) => item.key))
  return order
}

function getIndicatorTargetKey(
  items: RailEntry[],
  value: string | undefined,
  expandedKeys: Set<string>,
  collapsed: boolean,
) {
  const parentKey = findParentSubmenuKey(items, value)

  if (!parentKey) {
    return value
  }

  if (collapsed || !expandedKeys.has(parentKey)) {
    return parentKey
  }

  return value
}

function getSelectionDirection(
  previousTarget: string | undefined,
  currentTarget: string | undefined,
  navigationOrder: string[],
): SelectionDirection {
  if (!previousTarget || !currentTarget || previousTarget === currentTarget) {
    return null
  }

  const previousIndex = navigationOrder.indexOf(previousTarget)
  const currentIndex = navigationOrder.indexOf(currentTarget)

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

function ChevronIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path
        d="M3.22 5.97a.75.75 0 0 1 1.06 0L8 9.69l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L3.22 7.03a.75.75 0 0 1 0-1.06Z"
        fill="currentColor"
      />
    </svg>
  )
}

function getFlyoutThemeStyle(element: HTMLElement | null) {
  if (!element || typeof window === 'undefined') {
    return {}
  }

  const style = window.getComputedStyle(element)

  return {
    '--app-rail-text-color': style.getPropertyValue('--app-rail-text-color'),
    '--app-rail-muted-text-color': style.getPropertyValue(
      '--app-rail-muted-text-color',
    ),
    '--app-rail-hover-bg': style.getPropertyValue('--app-rail-hover-bg'),
    '--app-rail-accent-color': style.getPropertyValue(
      '--app-rail-accent-color',
    ),
    '--app-rail-accent-bg': style.getPropertyValue('--app-rail-accent-bg'),
    '--app-rail-disabled-text-color': style.getPropertyValue(
      '--app-rail-disabled-text-color',
    ),
    '--app-rail-flyout-bg': style.getPropertyValue('--app-rail-flyout-bg'),
    '--app-rail-flyout-border-color': style.getPropertyValue(
      '--app-rail-flyout-border-color',
    ),
    '--app-rail-flyout-shadow': style.getPropertyValue(
      '--app-rail-flyout-shadow',
    ),
  } as CSSProperties
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
  const railRef = useRef<HTMLElement | null>(null)
  const [autoCollapsed, setAutoCollapsed] = useState(false)
  const isCollapsed = isControlled ? collapsed : autoCollapsed
  const previousCollapsed = useRef(isCollapsed)
  const triggerRefs = useRef(new Map<string, HTMLButtonElement>())
  const [flyout, setFlyout] = useState<FlyoutState>(null)
  const [expandedState, setExpandedState] = useState<ExpandedState>(() => {
    const parentKey = findParentSubmenuKey(items, value)

    return {
      value,
      keys: parentKey ? new Set([parentKey]) : new Set(),
    }
  })
  const expandedKeys =
    expandedState.value === value
      ? expandedState.keys
      : (() => {
          const keys = new Set(expandedState.keys)
          const parentKey = findParentSubmenuKey(items, value)

          if (parentKey) {
            keys.add(parentKey)
          }

          return keys
        })()
  const indicatorTarget = getIndicatorTargetKey(
    items,
    value,
    expandedKeys,
    isCollapsed,
  )
  const [selectionTransition, setSelectionTransition] =
    useState<SelectionTransition>({
      target: indicatorTarget,
      direction: null,
    })
  const currentFlyout =
    isCollapsed && flyout?.value === value ? flyout : null
  const navigationOrder = getVisibleNavigationOrder(
    items,
    footerItems,
    expandedKeys,
    isCollapsed,
  )
  const selectionDirection =
    selectionTransition.target === indicatorTarget
      ? selectionTransition.direction
      : null

  if (expandedState.value !== value) {
    const keys = new Set(expandedState.keys)
    const parentKey = findParentSubmenuKey(items, value)

    if (parentKey) {
      keys.add(parentKey)
    }

    setExpandedState({ value, keys })
  }

  const closeFlyout = () => setFlyout(null)

  const handleItemChange = (nextValue: string) => {
    const nextItem = findLinkItem(items, footerItems, nextValue)

    if (nextItem?.disabled) {
      return
    }

    const nextParentKey = findParentSubmenuKey(items, nextValue)
    const nextTarget =
      isCollapsed && nextParentKey ? nextParentKey : nextValue

    setSelectionTransition({
      target: nextTarget,
      direction: getSelectionDirection(
        indicatorTarget,
        nextTarget,
        navigationOrder,
      ),
    })
    closeFlyout()
    onChange?.(nextValue)
  }

  const toggleSubmenu = (item: RailSubmenu) => {
    if (item.disabled) {
      return
    }

    if (isCollapsed) {
      const trigger = triggerRefs.current.get(item.key)

      if (!trigger) {
        return
      }

      const rect = trigger.getBoundingClientRect()
      const themeStyle = getFlyoutThemeStyle(railRef.current)
      setFlyout((current) =>
        current?.key === item.key && current.value === value
          ? null
          : { key: item.key, rect, value, themeStyle },
      )
      return
    }

    closeFlyout()
    setExpandedState((current) => {
      const keys = new Set(
        current.value === value ? current.keys : expandedKeys,
      )

      if (keys.has(item.key)) {
        keys.delete(item.key)
      } else {
        keys.add(item.key)
      }

      return { value, keys }
    })
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
    const closeTimeout =
      previous !== isCollapsed ? window.setTimeout(closeFlyout, 0) : undefined

    if (!isControlled && previous !== isCollapsed) {
      onCollapsedChange?.(isCollapsed)
    }

    return () => {
      if (closeTimeout !== undefined) {
        window.clearTimeout(closeTimeout)
      }
    }
  }, [isCollapsed, isControlled, onCollapsedChange])

  useEffect(() => {
    if (!currentFlyout) {
      return
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target

      if (!(target instanceof Node)) {
        return
      }

      const trigger = triggerRefs.current.get(currentFlyout.key)
      const flyoutElement = document.querySelector(
        `[data-app-rail-flyout="${currentFlyout.key}"]`,
      )

      if (trigger?.contains(target) || flyoutElement?.contains(target)) {
        return
      }

      closeFlyout()
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return
      }

      event.preventDefault()
      closeFlyout()
      triggerRefs.current
        .get(currentFlyout.key)
        ?.focus({ preventScroll: true })
    }

    document.addEventListener('pointerdown', handlePointerDown, true)
    document.addEventListener('keydown', handleKeyDown, true)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true)
      document.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [currentFlyout])

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

  const renderLinkItem = (item: RailLinkItem, nested = false) => {
    const isActive = indicatorTarget === item.key
    const itemClassNames = [
      'app-rail__item',
      nested ? 'app-rail__submenu-item' : '',
      nested && item.icon ? 'app-rail__submenu-item--with-icon' : '',
    ]

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
        className={itemClassNames.filter(Boolean).join(' ')}
        disabled={item.disabled}
        onClick={() => handleItemChange(item.key)}
        title={isCollapsed && !nested ? item.label : undefined}
        type="button"
      >
        {(item.icon || !nested) && (
          <span className="app-rail__icon">{item.icon}</span>
        )}
        {(!isCollapsed || nested) && (
          <span className="app-rail__label">{item.label}</span>
        )}
      </button>
    )
  }

  const renderSubmenu = (item: RailSubmenu) => {
    const expanded = expandedKeys.has(item.key)
    const isActive = indicatorTarget === item.key
    const itemClassNames = [
      'app-rail__item',
      'app-rail__submenu-trigger',
      isActive ? 'app-rail__item--active' : '',
    ]

    if (isActive && selectionDirection) {
      itemClassNames.push(
        `app-rail__item--indicator-enter-${selectionDirection}`,
      )
    }

    return (
      <div className="app-rail__submenu" key={item.key}>
        <button
          ref={(node) => {
            if (node) {
              triggerRefs.current.set(item.key, node)
            } else {
              triggerRefs.current.delete(item.key)
            }
          }}
          className={itemClassNames.filter(Boolean).join(' ')}
          disabled={item.disabled}
          onClick={() => toggleSubmenu(item)}
          title={isCollapsed ? item.label : undefined}
          type="button"
          aria-expanded={
            isCollapsed ? currentFlyout?.key === item.key : expanded
          }
          aria-haspopup={isCollapsed ? 'dialog' : undefined}
        >
          {item.icon && <span className="app-rail__icon">{item.icon}</span>}
          {!isCollapsed && (
            <>
              <span className="app-rail__label">{item.label}</span>
              <span
                className={[
                  'app-rail__submenu-chevron',
                  expanded ? 'app-rail__submenu-chevron--expanded' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <ChevronIcon />
              </span>
            </>
          )}
        </button>

        {!isCollapsed && (
          <div
            className={[
              'app-rail__submenu-content',
              expanded ? 'app-rail__submenu-content--expanded' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <div className="app-rail__submenu-inner">
              {item.children.map((child) => renderLinkItem(child, true))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const activeFlyoutSubmenu = findSubmenu(items, currentFlyout?.key)

  return (
    <aside ref={railRef} className={rootClassName} style={style}>
      <nav className="app-rail__nav" aria-label="Primary">
        {items.map((item, index) => {
          if (isRailGroup(item)) {
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

          if (isRailSubmenu(item)) {
            return renderSubmenu(item)
          }

          return renderLinkItem(item)
        })}
      </nav>

      {footerItems.length > 0 && (
        <div className="app-rail__footer">
          {footerItems.map((item) => renderLinkItem(item))}
        </div>
      )}

      {currentFlyout && activeFlyoutSubmenu ? (
        <RailSubmenuFlyout
          activeValue={value}
          flyout={currentFlyout}
          onChange={handleItemChange}
          submenu={activeFlyoutSubmenu}
        />
      ) : null}
    </aside>
  )
}

function RailSubmenuFlyout({
  activeValue,
  flyout,
  onChange,
  submenu,
}: {
  activeValue?: string
  flyout: Exclude<FlyoutState, null>
  onChange: (key: string) => void
  submenu: RailSubmenu
}) {
  const flyoutRef = useRef<HTMLDivElement | null>(null)
  const [position, setPosition] = useState<FlyoutPosition>({
    left: flyout.rect.right + FLYOUT_GAP,
    top: flyout.rect.top,
    visible: false,
  })

  useLayoutEffect(() => {
    if (!flyoutRef.current || typeof window === 'undefined') {
      return
    }

    const rect = flyoutRef.current.getBoundingClientRect()
    const maxLeft = window.innerWidth - rect.width - FLYOUT_MARGIN
    const maxTop = window.innerHeight - rect.height - FLYOUT_MARGIN

    setPosition({
      left: Math.max(
        FLYOUT_MARGIN,
        Math.min(flyout.rect.right + FLYOUT_GAP, maxLeft),
      ),
      top: Math.max(FLYOUT_MARGIN, Math.min(flyout.rect.top, maxTop)),
      visible: true,
    })
  }, [flyout.rect])

  if (typeof document === 'undefined') {
    return null
  }

  return createPortal(
    <div
      ref={flyoutRef}
      className="app-rail-flyout"
      data-app-rail-flyout={submenu.key}
      style={{
        ...flyout.themeStyle,
        left: position.left,
        top: position.top,
        visibility: position.visible ? 'visible' : 'hidden',
      }}
      aria-label={submenu.label}
    >
      <div className="app-rail-flyout__title">{submenu.label}</div>
      <div className="app-rail-flyout__items">
        {submenu.children.map((child) => (
          <button
            className={[
              'app-rail-flyout__item',
              activeValue === child.key ? 'app-rail-flyout__item--active' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            disabled={child.disabled}
            key={child.key}
            onClick={() => onChange(child.key)}
            type="button"
          >
            {child.icon ? (
              <span className="app-rail-flyout__icon">{child.icon}</span>
            ) : null}
            <span className="app-rail-flyout__label">{child.label}</span>
          </button>
        ))}
      </div>
    </div>,
    document.body,
  )
}
