import { useEffect, useMemo, useRef, useState } from 'react'
import type {
  AppContextMenuItem,
  AppContextMenuSeparatorItem,
  AppContextMenuSubmenuItem,
} from './types'
import './AppContextMenuLayer.css'
import '../scroll-area/AppScrollArea.css'

const VIEWPORT_PADDING = 8
const SUBMENU_GAP = 4
const SUBMENU_OPEN_DELAY = 220

export interface AppContextMenuState {
  items: AppContextMenuItem[]
  x: number
  y: number
  trigger: HTMLElement | null
  keyboard: boolean
  preserveTriggerFocus?: boolean
}

export interface AppContextMenuLayerProps {
  menu: AppContextMenuState | null
  onClose: () => void
}

type Placement = {
  x: number
  y: number
  origin: string
  measured: boolean
}

type MenuPanel = {
  items: AppContextMenuItem[]
  parentIndex: number | null
}

type MenuLayerState = {
  menu: AppContextMenuState | null
  openPath: number[]
  activeIndexes: number[]
}

type PlacementState = {
  menu: AppContextMenuState | null
  pathKey: string
  placements: Placement[]
}

const hiddenPlacement: Placement = {
  x: -10000,
  y: -10000,
  origin: 'top left',
  measured: false,
}

function isSeparator(
  item: AppContextMenuItem,
): item is AppContextMenuSeparatorItem {
  return 'type' in item && item.type === 'separator'
}

function isSubmenu(
  item: AppContextMenuItem,
): item is AppContextMenuSubmenuItem {
  return !isSeparator(item) && 'submenu' in item
}

function isEnabledItem(item: AppContextMenuItem) {
  return (
    !isSeparator(item) &&
    !item.disabled &&
    (!isSubmenu(item) || item.submenu.length > 0)
  )
}

function enabledIndexes(items: AppContextMenuItem[]) {
  return items.flatMap((item, index) => (isEnabledItem(item) ? [index] : []))
}

function firstEnabledIndex(items: AppContextMenuItem[]) {
  return enabledIndexes(items)[0] ?? -1
}

function panelPathKey(openPath: number[]) {
  return openPath.join('/')
}

function matchesPanelPath(
  placementPathKey: string,
  openPath: number[],
  level: number,
) {
  if (level === 0) {
    return true
  }

  const placementPath = placementPathKey ? placementPathKey.split('/') : []

  if (placementPath.length < level) {
    return false
  }

  return openPath
    .slice(0, level)
    .every((pathIndex, index) => placementPath[index] === String(pathIndex))
}

function getPanels(menu: AppContextMenuState, openPath: number[]) {
  const panels: MenuPanel[] = [{ items: menu.items, parentIndex: null }]
  let items = menu.items

  for (const index of openPath) {
    const item = items[index]

    if (!item || !isSubmenu(item) || item.disabled || item.submenu.length === 0) {
      break
    }

    panels.push({ items: item.submenu, parentIndex: index })
    items = item.submenu
  }

  return panels
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function placeRoot(menu: AppContextMenuState, rect: DOMRect): Placement {
  const horizontalFlip =
    menu.x + rect.width > window.innerWidth - VIEWPORT_PADDING
  const verticalFlip =
    menu.y + rect.height > window.innerHeight - VIEWPORT_PADDING
  const x = horizontalFlip
    ? Math.max(VIEWPORT_PADDING, menu.x - rect.width)
    : Math.max(VIEWPORT_PADDING, menu.x)
  const y = verticalFlip
    ? Math.max(VIEWPORT_PADDING, menu.y - rect.height)
    : Math.max(VIEWPORT_PADDING, menu.y)

  return {
    x: Math.min(x, window.innerWidth - VIEWPORT_PADDING),
    y: Math.min(y, window.innerHeight - VIEWPORT_PADDING),
    origin: `${verticalFlip ? 'bottom' : 'top'} ${
      horizontalFlip ? 'right' : 'left'
    }`,
    measured: true,
  }
}

function placeSubmenu(panelRect: DOMRect, parentRect: DOMRect): Placement {
  const fitsRight =
    parentRect.right + SUBMENU_GAP + panelRect.width <=
    window.innerWidth - VIEWPORT_PADDING
  const fitsLeft =
    parentRect.left - SUBMENU_GAP - panelRect.width >= VIEWPORT_PADDING
  const horizontalFlip = !fitsRight && fitsLeft
  const idealX = horizontalFlip
    ? parentRect.left - SUBMENU_GAP - panelRect.width
    : parentRect.right + SUBMENU_GAP
  const idealY = parentRect.top
  const maxX = window.innerWidth - VIEWPORT_PADDING - panelRect.width
  const maxY = window.innerHeight - VIEWPORT_PADDING - panelRect.height
  const x = clamp(idealX, VIEWPORT_PADDING, Math.max(VIEWPORT_PADDING, maxX))
  const y = clamp(idealY, VIEWPORT_PADDING, Math.max(VIEWPORT_PADDING, maxY))

  return {
    x,
    y,
    origin: `top ${horizontalFlip ? 'right' : 'left'}`,
    measured: true,
  }
}

function samePlacements(left: Placement[], right: Placement[]) {
  return (
    left.length === right.length &&
    left.every((placement, index) => {
      const other = right[index]

      return (
        other &&
        placement.x === other.x &&
        placement.y === other.y &&
        placement.origin === other.origin &&
        placement.measured === other.measured
      )
    })
  )
}

function getRenderedPlacement(
  state: PlacementState,
  menu: AppContextMenuState,
  openPath: number[],
  level: number,
) {
  const placement = state.menu === menu ? state.placements[level] : undefined

  if (
    placement?.measured &&
    matchesPanelPath(state.pathKey, openPath, level)
  ) {
    return placement
  }

  return hiddenPlacement
}

export function AppContextMenuLayer({
  menu,
  onClose,
}: AppContextMenuLayerProps) {
  const menuRefs = useRef<Array<HTMLDivElement | null>>([])
  const itemRefs = useRef<Array<Array<HTMLButtonElement | null>>>([])
  const hoverTimerRef = useRef<number | null>(null)
  const measureFrameRef = useRef<number | null>(null)
  const keyboardNavigationRef = useRef(false)
  const [layerState, setLayerState] = useState<MenuLayerState>({
    menu: null,
    openPath: [],
    activeIndexes: [],
  })
  const [placementState, setPlacementState] = useState<PlacementState>({
    menu: null,
    pathKey: '',
    placements: [],
  })

  const currentState =
    layerState.menu === menu
      ? layerState
      : {
          menu,
          openPath: [],
          activeIndexes: [menu?.keyboard ? firstEnabledIndex(menu.items) : -1],
        }
  const openPath = currentState.openPath
  const pathKey = panelPathKey(openPath)
  const panels = useMemo(
    () => (menu ? getPanels(menu, openPath) : []),
    [menu, openPath],
  )

  useEffect(() => {
    if (menu && layerState.menu !== menu) {
      keyboardNavigationRef.current = menu.keyboard
    }
  }, [layerState.menu, menu])

  const clearHoverTimer = () => {
    if (hoverTimerRef.current !== null) {
      window.clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = null
    }
  }

  const updateLayerState = (
    updater: (state: MenuLayerState) => MenuLayerState,
  ) => {
    setLayerState((state) => {
      const base =
        state.menu === menu
          ? state
          : {
              menu,
              openPath: [],
              activeIndexes: [
                menu?.keyboard ? firstEnabledIndex(menu.items) : -1,
              ],
            }

      return updater(base)
    })
  }

  const scheduleMeasure = () => {
    if (measureFrameRef.current !== null) {
      window.cancelAnimationFrame(measureFrameRef.current)
    }

    measureFrameRef.current = window.requestAnimationFrame(() => {
      measureFrameRef.current = null

      if (!menu) {
        return
      }

      const placements = panels.map((panel, level) => {
        const node = menuRefs.current[level]

        if (!node) {
          return hiddenPlacement
        }

        const rect = node.getBoundingClientRect()

        if (level === 0) {
          return placeRoot(menu, rect)
        }

        const parentIndex = panel.parentIndex
        const parentNode =
          parentIndex === null
            ? null
            : itemRefs.current[level - 1]?.[parentIndex]

        if (!parentNode) {
          return hiddenPlacement
        }

        return placeSubmenu(rect, parentNode.getBoundingClientRect())
      })

      setPlacementState((current) => {
        if (
          current.menu === menu &&
          current.pathKey === pathKey &&
          samePlacements(current.placements, placements)
        ) {
          return current
        }

        return {
          menu,
          pathKey,
          placements,
        }
      })
    })
  }

  useEffect(
    () => () => {
      clearHoverTimer()

      if (measureFrameRef.current !== null) {
        window.cancelAnimationFrame(measureFrameRef.current)
      }
    },
    [],
  )

  useEffect(() => {
    if (!menu) {
      return
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Node)) {
        return
      }

      const clickedInsideMenu = menuRefs.current.some((node) =>
        node?.contains(event.target as Node),
      )

      if (!clickedInsideMenu) {
        onClose()
      }
    }

    const handleBlur = () => onClose()
    const handleResize = () => onClose()
    const handleScroll = () => onClose()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown, true)
    document.addEventListener('keydown', handleKeyDown, true)
    window.addEventListener('blur', handleBlur)
    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleScroll, true)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true)
      document.removeEventListener('keydown', handleKeyDown, true)
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [menu, onClose])

  useEffect(() => {
    if (!menu) {
      return
    }

    if (
      placementState.menu !== menu ||
      placementState.pathKey !== pathKey ||
      placementState.placements.length !== panels.length ||
      placementState.placements.some((placement) => !placement.measured)
    ) {
      return
    }

    if (menu.preserveTriggerFocus) {
      return
    }

    if (keyboardNavigationRef.current) {
      const level = panels.length - 1
      const activeIndex = currentState.activeIndexes[level] ?? -1

      if (activeIndex >= 0) {
        itemRefs.current[level]?.[activeIndex]?.focus()
        return
      }
    }

    menuRefs.current[0]?.focus({ preventScroll: true })
  }, [currentState.activeIndexes, menu, panels.length, pathKey, placementState])

  if (!menu) {
    return null
  }

  const setActiveIndex = (level: number, index: number) => {
    updateLayerState((state) => ({
      menu,
      openPath:
        state.openPath[level] === index
          ? state.openPath
          : state.openPath.slice(0, level),
      activeIndexes: [
        ...state.activeIndexes.slice(0, level),
        index,
        ...(
          state.openPath[level] === index
            ? state.activeIndexes.slice(level + 1)
            : []
        ),
      ],
    }))
  }

  const openSubmenu = (
    level: number,
    index: number,
    focusFirstItem: boolean,
  ) => {
    const item = panels[level]?.items[index]

    if (!item || !isSubmenu(item) || !isEnabledItem(item)) {
      return
    }

    updateLayerState((state) => ({
      menu,
      openPath: [...state.openPath.slice(0, level), index],
      activeIndexes: [
        ...state.activeIndexes.slice(0, level),
        index,
        focusFirstItem
          ? firstEnabledIndex(item.submenu)
          : state.openPath[level] === index
            ? (state.activeIndexes[level + 1] ?? -1)
            : -1,
      ],
    }))
  }

  const closeSubmenusAfter = (level: number) => {
    updateLayerState((state) => ({
      menu,
      openPath: state.openPath.slice(0, level),
      activeIndexes: state.activeIndexes.slice(0, level + 1),
    }))
  }

  const runItem = (item: AppContextMenuItem) => {
    if (!isEnabledItem(item) || isSubmenu(item) || isSeparator(item)) {
      return
    }

    onClose()
    item.onClick?.()
  }

  const moveActive = (level: number, direction: 1 | -1) => {
    const indexes = enabledIndexes(panels[level]?.items ?? [])

    if (indexes.length === 0) {
      return
    }

    const activeIndex = currentState.activeIndexes[level] ?? -1
    const currentEnabledIndex = indexes.indexOf(activeIndex)
    const nextEnabledIndex =
      currentEnabledIndex === -1
        ? direction === 1
          ? 0
          : indexes.length - 1
        : (currentEnabledIndex + direction + indexes.length) % indexes.length

    setActiveIndex(level, indexes[nextEnabledIndex])
  }

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
    level: number,
  ) => {
    const items = panels[level]?.items ?? []
    const activeIndex = currentState.activeIndexes[level] ?? -1
    const activeItem = items[activeIndex]

    keyboardNavigationRef.current = true

    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      moveActive(level, 1)
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      moveActive(level, -1)
      return
    }

    if (event.key === 'Home') {
      event.preventDefault()
      setActiveIndex(level, enabledIndexes(items)[0] ?? -1)
      return
    }

    if (event.key === 'End') {
      event.preventDefault()
      setActiveIndex(level, enabledIndexes(items).at(-1) ?? -1)
      return
    }

    if (event.key === 'ArrowRight') {
      if (activeItem && isSubmenu(activeItem) && isEnabledItem(activeItem)) {
        event.preventDefault()
        openSubmenu(level, activeIndex, true)
      }

      return
    }

    if (event.key === 'ArrowLeft') {
      if (level > 0) {
        event.preventDefault()
        updateLayerState((state) => ({
          menu,
          openPath: state.openPath.slice(0, level - 1),
          activeIndexes: state.activeIndexes.slice(0, level),
        }))
      }

      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()

      if (!activeItem) {
        return
      }

      if (isSubmenu(activeItem)) {
        openSubmenu(level, activeIndex, true)
        return
      }

      runItem(activeItem)
    }
  }

  return (
    <div className="app-context-menu-layer">
      {panels.map((panel, level) => {
        const placement = getRenderedPlacement(
          placementState,
          menu,
          openPath,
          level,
        )
        const activeIndex = currentState.activeIndexes[level] ?? -1

        return (
          <div
            ref={(node) => {
              menuRefs.current[level] = node
              scheduleMeasure()
            }}
            role="menu"
            tabIndex={-1}
            className="app-context-menu app-scrollbar"
            key={`menu-${level}-${openPath.slice(0, level).join('-')}`}
            style={{
              left: placement.x,
              top: placement.y,
              transformOrigin: placement.origin,
              visibility: placement.measured ? 'visible' : 'hidden',
            }}
            onKeyDown={(event) => handleKeyDown(event, level)}
          >
            {panel.items.map((item, index) => {
              if (isSeparator(item)) {
                return (
                  <div
                    className="app-context-menu__separator"
                    key={`separator-${index}`}
                    role="separator"
                  />
                )
              }

              const hasSubmenu = isSubmenu(item)
              const disabled = !isEnabledItem(item)
              const submenuOpen = openPath[level] === index

              return (
                <button
                  ref={(node) => {
                    itemRefs.current[level] ??= []
                    itemRefs.current[level][index] = node
                    scheduleMeasure()
                  }}
                  className={[
                    'app-context-menu__item',
                    item.danger ? 'app-context-menu__item--danger' : '',
                    activeIndex === index
                      ? 'app-context-menu__item--active'
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  key={item.key}
                  type="button"
                  role="menuitem"
                  tabIndex={activeIndex === index ? 0 : -1}
                  aria-disabled={disabled ? 'true' : undefined}
                  aria-haspopup={hasSubmenu ? 'menu' : undefined}
                  aria-expanded={hasSubmenu ? submenuOpen : undefined}
                  disabled={disabled}
                  onPointerEnter={() => {
                    if (disabled) {
                      return
                    }

                    keyboardNavigationRef.current = false
                    setActiveIndex(level, index)
                    clearHoverTimer()

                    if (hasSubmenu) {
                      if (submenuOpen) {
                        return
                      }

                      hoverTimerRef.current = window.setTimeout(() => {
                        hoverTimerRef.current = null
                        openSubmenu(level, index, false)
                      }, SUBMENU_OPEN_DELAY)
                      return
                    }

                    closeSubmenusAfter(level)
                  }}
                  onClick={() => {
                    if (hasSubmenu) {
                      keyboardNavigationRef.current = false
                      clearHoverTimer()
                      openSubmenu(level, index, false)
                      return
                    }

                    runItem(item)
                  }}
                >
                  <span className="app-context-menu__icon">{item.icon}</span>
                  <span className="app-context-menu__label">{item.label}</span>
                  {hasSubmenu ? (
                    <span
                      className="app-context-menu__submenu-indicator"
                      aria-hidden="true"
                    >
                      <svg viewBox="0 0 16 16" focusable="false">
                        <path
                          d="M6.47 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 1 1-1.06-1.06L9.19 8 6.47 5.28a.75.75 0 0 1 0-1.06Z"
                          fill="currentColor"
                        />
                      </svg>
                    </span>
                  ) : item.shortcut ? (
                    <span className="app-context-menu__shortcut">
                      {item.shortcut}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
