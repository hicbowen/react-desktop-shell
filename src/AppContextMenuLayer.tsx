import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type {
  AppContextMenuItem,
  AppContextMenuSeparatorItem,
} from './types'
import './AppContextMenuLayer.css'

const VIEWPORT_PADDING = 8

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

function isSeparator(
  item: AppContextMenuItem,
): item is AppContextMenuSeparatorItem {
  return 'type' in item && item.type === 'separator'
}

export function AppContextMenuLayer({
  menu,
  onClose,
}: AppContextMenuLayerProps) {
  const menuRef = useRef<HTMLDivElement | null>(null)
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([])
  const [activeState, setActiveState] = useState<{
    menu: AppContextMenuState | null
    index: number
  }>({
    menu: null,
    index: -1,
  })
  const [placement, setPlacement] = useState<Placement>({
    x: 0,
    y: 0,
    origin: 'top left',
    measured: false,
  })

  const enabledIndexes = useMemo(() => {
    if (!menu) {
      return []
    }

    return menu.items.flatMap((item, index) =>
      isSeparator(item) || item.disabled ? [] : [index],
    )
  }, [menu])

  if (activeState.menu !== menu) {
    setActiveState({
      menu,
      index: menu?.keyboard ? (enabledIndexes[0] ?? -1) : -1,
    })
  }

  const activeIndex = activeState.menu === menu ? activeState.index : -1
  const setActiveIndex = (index: number) => {
    setActiveState({ menu, index })
  }

  useEffect(() => {
    if (!menu) {
      return
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (
        menuRef.current &&
        event.target instanceof Node &&
        !menuRef.current.contains(event.target)
      ) {
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

  useLayoutEffect(() => {
    if (!menu || !menuRef.current) {
      return
    }

    const rect = menuRef.current.getBoundingClientRect()
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

    setPlacement({
      x: Math.min(x, window.innerWidth - VIEWPORT_PADDING),
      y: Math.min(y, window.innerHeight - VIEWPORT_PADDING),
      origin: `${verticalFlip ? 'bottom' : 'top'} ${
        horizontalFlip ? 'right' : 'left'
      }`,
      measured: true,
    })
  }, [menu])

  useEffect(() => {
    if (!menu || !placement.measured) {
      return
    }

    if (menu.preserveTriggerFocus) {
      return
    }

    if (menu.keyboard && activeIndex >= 0) {
      itemRefs.current[activeIndex]?.focus()
      return
    }

    menuRef.current?.focus({ preventScroll: true })
  }, [activeIndex, menu, placement.measured])

  if (!menu) {
    return null
  }

  const moveActive = (direction: 1 | -1) => {
    if (enabledIndexes.length === 0) {
      return
    }

    const currentEnabledIndex = enabledIndexes.indexOf(activeIndex)
    const nextEnabledIndex =
      currentEnabledIndex === -1
        ? direction === 1
          ? 0
          : enabledIndexes.length - 1
        : (currentEnabledIndex + direction + enabledIndexes.length) %
          enabledIndexes.length

    setActiveIndex(enabledIndexes[nextEnabledIndex])
  }

  const runItem = (item: AppContextMenuItem) => {
    if (isSeparator(item) || item.disabled) {
      return
    }

    onClose()
    item.onClick?.()
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      moveActive(1)
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      moveActive(-1)
      return
    }

    if (event.key === 'Home') {
      event.preventDefault()
      setActiveIndex(enabledIndexes[0] ?? -1)
      return
    }

    if (event.key === 'End') {
      event.preventDefault()
      setActiveIndex(enabledIndexes.at(-1) ?? -1)
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      const item = menu.items[activeIndex]
      if (item) {
        runItem(item)
      }
    }
  }

  return (
    <div className="app-context-menu-layer">
      <div
        ref={menuRef}
        role="menu"
        tabIndex={-1}
        className="app-context-menu"
        style={{
          left: placement.x,
          top: placement.y,
          transformOrigin: placement.origin,
          visibility: placement.measured ? 'visible' : 'hidden',
        }}
        onKeyDown={handleKeyDown}
      >
        {menu.items.map((item, index) => {
          if (isSeparator(item)) {
            return (
              <div
                className="app-context-menu__separator"
                key={`separator-${index}`}
                role="separator"
              />
            )
          }

          return (
            <button
              ref={(node) => {
                itemRefs.current[index] = node
              }}
              className={[
                'app-context-menu__item',
                item.danger ? 'app-context-menu__item--danger' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              key={item.key}
              type="button"
              role="menuitem"
              tabIndex={activeIndex === index ? 0 : -1}
              aria-disabled={item.disabled ? 'true' : undefined}
              disabled={item.disabled}
              onPointerEnter={() => {
                if (!item.disabled) {
                  setActiveIndex(index)
                }
              }}
              onClick={() => runItem(item)}
            >
              <span className="app-context-menu__icon">{item.icon}</span>
              <span className="app-context-menu__label">{item.label}</span>
              {item.shortcut ? (
                <span className="app-context-menu__shortcut">
                  {item.shortcut}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
