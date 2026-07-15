import { useEffect, useRef, type RefObject } from 'react'

export interface UseOverlayDismissOptions {
  open: boolean
  overlayRef: RefObject<HTMLElement | null>
  triggerRef?: RefObject<HTMLElement | null>
  onDismiss: () => void
  closeOnEscape?: boolean
  closeOnOutsidePointerDown?: boolean
  closeOnResize?: boolean
  closeOnExternalScroll?: boolean
  closeOnWindowBlur?: boolean
  restoreFocus?: boolean
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

    const dismiss = () => onDismissRef.current()
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target

      if (!(target instanceof Node)) {
        return
      }

      if (
        triggerRef?.current?.contains(target) ||
        overlayRef.current?.contains(target)
      ) {
        return
      }

      dismiss()
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return
      }

      event.preventDefault()
      dismiss()

      if (restoreFocus) {
        triggerRef?.current?.focus({ preventScroll: true })
      }
    }
    const handleScroll = (event: Event) => {
      const target = event.target

      if (target instanceof Node && overlayRef.current?.contains(target)) {
        return
      }

      dismiss()
    }

    if (closeOnOutsidePointerDown) {
      document.addEventListener('pointerdown', handlePointerDown, true)
    }
    if (closeOnEscape) {
      document.addEventListener('keydown', handleKeyDown, true)
    }
    if (closeOnResize) {
      window.addEventListener('resize', dismiss)
    }
    if (closeOnExternalScroll) {
      window.addEventListener('scroll', handleScroll, true)
    }
    if (closeOnWindowBlur) {
      window.addEventListener('blur', dismiss)
    }

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true)
      document.removeEventListener('keydown', handleKeyDown, true)
      window.removeEventListener('resize', dismiss)
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('blur', dismiss)
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
  ])
}
