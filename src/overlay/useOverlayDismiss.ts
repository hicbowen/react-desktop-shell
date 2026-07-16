import { useEffect, useRef, type RefObject } from 'react'

export type OverlayDismissReason =
  | 'escape'
  | 'outside-pointer'
  | 'resize'
  | 'scroll'
  | 'window-blur'

export interface UseOverlayDismissOptions {
  open: boolean
  overlayRef: RefObject<HTMLElement | null>
  triggerRef?: RefObject<HTMLElement | null>
  onDismiss: (reason: OverlayDismissReason) => void
  closeOnEscape?: boolean
  closeOnOutsidePointerDown?: boolean
  closeOnResize?: boolean
  closeOnExternalScroll?: boolean
  closeOnWindowBlur?: boolean
  restoreFocus?: boolean
  isInsideBranch?: (target: Node) => boolean
  isTopMost?: () => boolean
}

export function useOverlayDismiss({
  open,
  overlayRef,
  triggerRef,
  onDismiss,
  closeOnEscape = true,
  closeOnOutsidePointerDown = true,
  closeOnResize = true,
  closeOnExternalScroll = true,
  closeOnWindowBlur = true,
  restoreFocus = false,
  isInsideBranch,
  isTopMost,
}: UseOverlayDismissOptions) {
  const onDismissRef = useRef(onDismiss)

  useEffect(() => {
    onDismissRef.current = onDismiss
  }, [onDismiss])

  useEffect(() => {
    if (
      !open ||
      typeof document === 'undefined' ||
      typeof window === 'undefined'
    ) {
      return
    }

    const dismiss = (reason: OverlayDismissReason) =>
      onDismissRef.current(reason)
    const canDismiss = () => isTopMost?.() ?? true
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target

      if (!(target instanceof Node)) {
        return
      }

      if (
        triggerRef?.current?.contains(target) ||
        overlayRef.current?.contains(target) ||
        isInsideBranch?.(target)
      ) {
        return
      }

      if (!canDismiss()) {
        return
      }

      dismiss('outside-pointer')
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return
      }

      if (event.defaultPrevented || !canDismiss()) {
        return
      }

      event.preventDefault()
      dismiss('escape')

      if (restoreFocus) {
        triggerRef?.current?.focus({ preventScroll: true })
      }
    }
    const handleScroll = (event: Event) => {
      const target = event.target

      if (target instanceof Node && overlayRef.current?.contains(target)) {
        return
      }

      if (!canDismiss()) {
        return
      }

      dismiss('scroll')
    }
    const handleResize = () => {
      if (canDismiss()) dismiss('resize')
    }
    const handleWindowBlur = () => {
      if (canDismiss()) dismiss('window-blur')
    }

    if (closeOnOutsidePointerDown) {
      document.addEventListener('pointerdown', handlePointerDown, true)
    }
    if (closeOnEscape) {
      document.addEventListener('keydown', handleKeyDown, true)
    }
    if (closeOnResize) {
      window.addEventListener('resize', handleResize)
    }
    if (closeOnExternalScroll) {
      window.addEventListener('scroll', handleScroll, true)
    }
    if (closeOnWindowBlur) {
      window.addEventListener('blur', handleWindowBlur)
    }

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true)
      document.removeEventListener('keydown', handleKeyDown, true)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('blur', handleWindowBlur)
    }
  }, [
    closeOnEscape,
    closeOnExternalScroll,
    closeOnOutsidePointerDown,
    closeOnResize,
    closeOnWindowBlur,
    open,
    overlayRef,
    restoreFocus,
    triggerRef,
    isInsideBranch,
    isTopMost,
  ])
}
