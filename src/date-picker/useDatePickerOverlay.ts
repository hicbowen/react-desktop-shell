import { useEffect, useRef, useState, type RefObject } from 'react'
import { useAppOverlayHost } from '../overlay/AppOverlayHostContext'
import { useOverlayTree } from '../overlay/OverlayTreeContext'
import { useAnchoredOverlayPosition } from '../overlay/useAnchoredOverlayPosition'
import {
  useOverlayDismiss,
} from '../overlay/useOverlayDismiss'
import type { PickerCloseReason } from '../overlay/pickerCloseReason'

interface UseDatePickerOverlayOptions {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  anchorRef: RefObject<HTMLElement | null>
  overlayRef: RefObject<HTMLElement | null>
  onAfterClose?: (reason: PickerCloseReason | null) => void
  dependencies?: readonly unknown[]
}

export function useDatePickerOverlay({
  open,
  defaultOpen = false,
  onOpenChange,
  anchorRef,
  overlayRef,
  onAfterClose,
  dependencies = [],
}: UseDatePickerOverlayOptions) {
  const controlled = open !== undefined
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const visible = controlled ? open : internalOpen
  const overlayHost = useAppOverlayHost()
  const overlayTree = useOverlayTree(visible, overlayRef)
  const previousVisibleRef = useRef(visible)
  const pendingCloseReasonRef = useRef<PickerCloseReason | null>(null)
  const onAfterCloseRef = useRef(onAfterClose)
  const position = useAnchoredOverlayPosition({
    open: visible,
    triggerRef: anchorRef,
    overlayRef,
    preferredPlacement: 'bottom-start',
    gap: 5,
    viewportPadding: 8,
    maxHeight: 520,
    maxWidth: 720,
    dependencies,
  })
  useEffect(() => {
    onAfterCloseRef.current = onAfterClose
  }, [onAfterClose])

  useEffect(() => {
    const didClose = previousVisibleRef.current && !visible
    if (didClose) {
      onAfterCloseRef.current?.(pendingCloseReasonRef.current)
      pendingCloseReasonRef.current = null
    }
    previousVisibleRef.current = visible
  }, [visible])

  const setVisible = (next: boolean) => {
    if (next) pendingCloseReasonRef.current = null
    if (!controlled) setInternalOpen(next)
    onOpenChange?.(next)
  }
  const requestClose = (reason: PickerCloseReason) => {
    pendingCloseReasonRef.current = reason
    if (!controlled) setInternalOpen(false)
    onOpenChange?.(false)
  }

  useOverlayDismiss({
    open: visible,
    overlayRef,
    triggerRef: anchorRef,
    onDismiss: requestClose,
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
    requestClose,
    overlayHost,
    overlayTree,
    position,
  }
}
