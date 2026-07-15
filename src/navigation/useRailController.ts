import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, RefObject } from 'react'
import type {
  AppRailProps,
  RailEntry,
  RailItem,
  RailLinkItem,
  RailSubmenu,
} from './types'
import type { FlyoutState, SelectionDirection } from './types'

const DEFAULT_COLLAPSE_BREAKPOINT = 700

type ExpandedState = {
  value?: string
  keys: Set<string>
}

export function isRailGroup(
  item: RailEntry,
): item is Extract<RailEntry, { type: 'group' }> {
  return item.type === 'group'
}

export function isRailSubmenu(item: RailEntry): item is RailSubmenu {
  return item.type === 'submenu'
}

function isRailLinkItem(item: RailEntry): item is RailLinkItem {
  return !isRailGroup(item) && !isRailSubmenu(item)
}

function findParentSubmenuKey(items: RailEntry[], value: string | undefined) {
  if (!value) return undefined

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

function findSubmenu(items: RailEntry[], key: string | undefined) {
  if (!key) return undefined
  return items.find(
    (item): item is RailSubmenu => isRailSubmenu(item) && item.key === key,
  )
}

function findLinkItem(
  items: RailEntry[],
  footerItems: RailItem[],
  key: string,
) {
  for (const item of items) {
    if (isRailLinkItem(item) && item.key === key) return item
    if (isRailSubmenu(item)) {
      const child = item.children.find((entry) => entry.key === key)
      if (child) return child
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
    if (isRailGroup(item)) continue
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
  if (!parentKey) return value
  return collapsed || !expandedKeys.has(parentKey) ? parentKey : value
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
  if (previousIndex === -1 || currentIndex === -1) return null
  if (currentIndex > previousIndex) return 'down'
  if (currentIndex < previousIndex) return 'up'
  return null
}

function getAutoCollapsed(collapseBreakpoint: number) {
  return (
    typeof window !== 'undefined' && window.innerWidth < collapseBreakpoint
  )
}

function getFlyoutFallbackThemeStyle(element: HTMLElement | null) {
  if (!element || typeof window === 'undefined') return {}
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

export function useRailController({
  value,
  items,
  footerItems,
  collapsed,
  collapseBreakpoint = DEFAULT_COLLAPSE_BREAKPOINT,
  onCollapsedChange,
  onChange,
  railRef,
  triggerRefs,
}: Pick<
  AppRailProps,
  | 'value'
  | 'items'
  | 'footerItems'
  | 'collapsed'
  | 'collapseBreakpoint'
  | 'onCollapsedChange'
  | 'onChange'
> & {
  footerItems: RailItem[]
  railRef: RefObject<HTMLElement | null>
  triggerRefs: RefObject<Map<string, HTMLButtonElement>>
}) {
  const isControlled = collapsed !== undefined
  const [autoCollapsed, setAutoCollapsed] = useState(false)
  const isCollapsed = isControlled ? collapsed : autoCollapsed
  const previousCollapsed = useRef(isCollapsed)
  const [flyout, setFlyout] = useState<FlyoutState>(null)
  const [expandedState, setExpandedState] = useState<ExpandedState>(() => {
    const parentKey = findParentSubmenuKey(items, value)
    return { value, keys: parentKey ? new Set([parentKey]) : new Set() }
  })
  const expandedKeys =
    expandedState.value === value
      ? expandedState.keys
      : (() => {
          const keys = new Set(expandedState.keys)
          const parentKey = findParentSubmenuKey(items, value)
          if (parentKey) keys.add(parentKey)
          return keys
        })()
  const indicatorTarget = getIndicatorTargetKey(
    items,
    value,
    expandedKeys,
    isCollapsed,
  )
  const [selectionTransition, setSelectionTransition] = useState<{
    target?: string
    direction: SelectionDirection
  }>({ target: indicatorTarget, direction: null })
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
    if (parentKey) keys.add(parentKey)
    setExpandedState({ value, keys })
  }

  const closeFlyout = () => setFlyout(null)
  const handleItemChange = (nextValue: string) => {
    const nextItem = findLinkItem(items, footerItems, nextValue)
    if (nextItem?.disabled) return
    const nextParentKey = findParentSubmenuKey(items, nextValue)
    const nextTarget = isCollapsed && nextParentKey ? nextParentKey : nextValue

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
    if (item.disabled) return

    if (isCollapsed) {
      const trigger = triggerRefs.current.get(item.key)
      if (!trigger) return
      const rect = trigger.getBoundingClientRect()
      const fallbackThemeStyle = getFlyoutFallbackThemeStyle(railRef.current)
      setFlyout((current) =>
        current?.key === item.key && current.value === value
          ? null
          : { key: item.key, rect, value, fallbackThemeStyle },
      )
      return
    }

    closeFlyout()
    setExpandedState((current) => {
      const keys = new Set(
        current.value === value ? current.keys : expandedKeys,
      )
      if (keys.has(item.key)) keys.delete(item.key)
      else keys.add(item.key)
      return { value, keys }
    })
  }

  useEffect(() => {
    if (isControlled || typeof window === 'undefined') return
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
      if (closeTimeout !== undefined) window.clearTimeout(closeTimeout)
    }
  }, [isCollapsed, isControlled, onCollapsedChange])

  return {
    isCollapsed,
    expandedKeys,
    indicatorTarget,
    selectionDirection,
    currentFlyout,
    activeFlyoutSubmenu: findSubmenu(items, currentFlyout?.key),
    closeFlyout,
    handleItemChange,
    toggleSubmenu,
  }
}
