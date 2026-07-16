import { useState, type RefObject } from 'react'
import { useAppOverlayHost } from '../overlay/AppOverlayHostContext'
import { useOverlayTree } from '../overlay/OverlayTreeContext'
import { useAnchoredOverlayPosition } from '../overlay/useAnchoredOverlayPosition'
import {
  useOverlayDismiss,
  type OverlayDismissReason,
} from '../overlay/useOverlayDismiss'

interface UseTimePickerOverlayOptions {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  anchorRef: RefObject<HTMLElement | null>
  overlayRef: RefObject<HTMLElement | null>
  focusRef: RefObject<HTMLElement | null>
  onDismiss?: (reason: OverlayDismissReason) => void
  dependencies?: readonly unknown[]
}

export function useTimePickerOverlay({
  open,
  defaultOpen = false,
  onOpenChange,
  anchorRef,
  overlayRef,
  focusRef,
  onDismiss,
  dependencies = [],
}: UseTimePickerOverlayOptions) {
  const controlled = open !== undefined
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const visible = controlled ? open : internalOpen
  const overlayHost = useAppOverlayHost()
  const overlayTree = useOverlayTree(visible, overlayRef)
  const position = useAnchoredOverlayPosition({
    open: visible,
    triggerRef: anchorRef,
    overlayRef,
    preferredPlacement: 'bottom-start',
    gap: 5,
    viewportPadding: 8,
    maxHeight: 520,
    maxWidth: 520,
    dependencies,
  })
  const setVisible = (next: boolean) => {
    if (!controlled) setInternalOpen(next)
    onOpenChange?.(next)
  }

  useOverlayDismiss({
    open: visible,
    overlayRef,
    triggerRef: anchorRef,
    onDismiss: (reason) => {
      onDismiss?.(reason)
      setVisible(false)
      if (reason === 'escape') {
        focusRef.current?.focus({ preventScroll: true })
      }
    },
    closeOnExternalScroll: false,
    closeOnResize: false,
    closeOnWindowBlur: true,
    restoreFocus: false,
    isInsideBranch: overlayTree.isInsideBranch,
    isTopMost: overlayTree.isTopMost,
  })

  return {
    visible,
    setVisible,
    overlayHost,
    overlayTree,
    position,
  }
}
