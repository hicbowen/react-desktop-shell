import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { RailSubmenu } from './types'
import type { FlyoutState } from './types'
import { RailBadge } from './RailBadge'

const FLYOUT_GAP = 6
const FLYOUT_MARGIN = 8

export function RailFlyout({
  activeValue,
  flyout,
  submenu,
  triggerContains,
  focusTrigger,
  onChange,
  onClose,
}: {
  activeValue?: string
  flyout: Exclude<FlyoutState, null>
  submenu: RailSubmenu
  triggerContains: (target: Node) => boolean
  focusTrigger: () => void
  onChange: (key: string) => void
  onClose: () => void
}) {
  const flyoutRef = useRef<HTMLDivElement | null>(null)
  const [position, setPosition] = useState({
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

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target

      if (!(target instanceof Node)) {
        return
      }

      if (triggerContains(target) || flyoutRef.current?.contains(target)) {
        return
      }

      onClose()
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return
      }

      event.preventDefault()
      onClose()
      focusTrigger()
    }

    document.addEventListener('pointerdown', handlePointerDown, true)
    document.addEventListener('keydown', handleKeyDown, true)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true)
      document.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [focusTrigger, onClose, triggerContains])

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
            <RailBadge
              content={child.badge}
              ariaLabel={child.badgeAriaLabel}
              collapsed={false}
            />
          </button>
        ))}
      </div>
    </div>,
    document.body,
  )
}
