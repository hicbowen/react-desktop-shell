import { useLayoutEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useAppOverlayHost } from '../overlay/AppOverlayHostContext'
import { useAnchoredOverlayPosition } from '../overlay/useAnchoredOverlayPosition'
import { useOverlayDismiss } from '../overlay/useOverlayDismiss'
import { RailBadge } from './RailBadge'
import type { FlyoutState, RailSubmenu } from './types'

const FLYOUT_GAP = 6
const FLYOUT_MAX_WIDTH = 280
const FLYOUT_VIEWPORT_PADDING = 8

export function RailFlyout({
  activeValue,
  flyout,
  submenu,
  getTrigger,
  onChange,
  onClose,
}: {
  activeValue?: string
  flyout: Exclude<FlyoutState, null>
  submenu: RailSubmenu
  getTrigger: () => HTMLButtonElement | null
  onChange: (key: string) => void
  onClose: () => void
}) {
  const flyoutRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const overlayHost = useAppOverlayHost()
  const position = useAnchoredOverlayPosition({
    open: true,
    triggerRect: flyout.rect,
    overlayRef: flyoutRef,
    preferredPlacement: 'right-start',
    gap: FLYOUT_GAP,
    viewportPadding: FLYOUT_VIEWPORT_PADDING,
    maxWidth: FLYOUT_MAX_WIDTH,
    dependencies: [submenu.children.length],
  })

  useLayoutEffect(() => {
    triggerRef.current = getTrigger()
  }, [getTrigger])

  useOverlayDismiss({
    open: true,
    triggerRef,
    overlayRef: flyoutRef,
    onDismiss: onClose,
    restoreFocus: true,
  })

  const fallbackThemeStyle = useMemo(
    () => (overlayHost ? undefined : flyout.fallbackThemeStyle),
    [flyout.fallbackThemeStyle, overlayHost],
  )

  if (typeof document === 'undefined') {
    return null
  }

  return createPortal(
    <div
      ref={flyoutRef}
      aria-label={submenu.label}
      className="app-rail-flyout app-scrollbar"
      data-app-rail-flyout={submenu.key}
      data-placement={position.placement}
      style={{
        ...fallbackThemeStyle,
        left: position.x,
        maxHeight: position.measured ? position.maxHeight : undefined,
        maxWidth: position.measured ? position.maxWidth : undefined,
        pointerEvents: position.measured ? undefined : 'none',
        top: position.y,
        visibility: position.measured ? 'visible' : 'hidden',
      }}
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
    overlayHost ?? document.body,
  )
}
