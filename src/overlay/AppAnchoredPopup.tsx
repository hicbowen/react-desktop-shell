import { useLayoutEffect, useRef, type AriaRole, type ReactNode, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { useAppOverlayHost } from './AppOverlayHostContext'
import { OVERLAY_SURFACE_FALLBACK_STYLE } from './surfaceFallback'
import { useAnchoredOverlayPosition } from './useAnchoredOverlayPosition'
import { useOverlayDismiss } from './useOverlayDismiss'

export function AppAnchoredPopup({
  children,
  ariaMultiselectable,
  className,
  dependencies = [],
  id,
  matchTriggerWidth = true,
  maxHeight = 320,
  maxWidth = 640,
  onDismiss,
  open,
  role,
  triggerRef,
}: {
  children: ReactNode
  ariaMultiselectable?: boolean
  className: string
  dependencies?: readonly unknown[]
  id?: string
  matchTriggerWidth?: boolean
  maxHeight?: number
  maxWidth?: number
  onDismiss: () => void
  open: boolean
  role?: AriaRole
  triggerRef: RefObject<HTMLElement | null>
}) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const overlayHost = useAppOverlayHost()
  const position = useAnchoredOverlayPosition({
    dependencies: [matchTriggerWidth, ...dependencies],
    gap: 4,
    maxHeight,
    maxWidth,
    open,
    overlayRef,
    preferredPlacement: 'bottom-start',
    triggerRef,
    viewportPadding: 8,
  })

  useLayoutEffect(() => {
    const overlay = overlayRef.current
    if (!open || !matchTriggerWidth || !overlay) return
    const width = triggerRef.current?.getBoundingClientRect().width
    overlay.style.width = width === undefined ? '' : `${width}px`
    overlay.style.minWidth = width === undefined ? '' : `${width}px`
  }, [matchTriggerWidth, open, triggerRef])

  useOverlayDismiss({
    closeOnExternalScroll: false,
    closeOnResize: false,
    onDismiss,
    open,
    overlayRef,
    restoreFocus: false,
    triggerRef,
  })

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div
      className={className}
      aria-multiselectable={ariaMultiselectable}
      data-placement={position.placement}
      id={id}
      ref={overlayRef}
      role={role}
      style={{
        ...(overlayHost ? undefined : OVERLAY_SURFACE_FALLBACK_STYLE),
        left: position.x,
        maxHeight: position.measured ? position.maxHeight : undefined,
        maxWidth: position.measured ? position.maxWidth : undefined,
        pointerEvents: position.measured ? 'auto' : 'none',
        position: 'fixed',
        right: 'auto',
        top: position.y,
        visibility: position.measured ? 'visible' : 'hidden',
      }}
    >
      {children}
    </div>,
    overlayHost ?? document.body,
  )
}
