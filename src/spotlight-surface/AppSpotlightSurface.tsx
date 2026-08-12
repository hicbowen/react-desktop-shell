import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react'
import { createPortal } from 'react-dom'
import { useAppOverlayHost } from '../overlay/AppOverlayHostContext'
import {
  OverlayParentContext,
  useOverlayTree,
} from '../overlay/OverlayTreeContext'
import { OVERLAY_SURFACE_FALLBACK_STYLE } from '../overlay/surfaceFallback'
import { useOverlayDismiss } from '../overlay/useOverlayDismiss'
import type { AppSpotlightSurfaceProps } from './types'
import './AppSpotlightSurface.css'

const EXIT_DURATION = 180
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
  '[contenteditable=""]',
].join(',')

function getFocusableElements(container: HTMLElement | null) {
  return container
    ? Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    : []
}

export function AppSpotlightSurface({
  open,
  onOpenChange,
  ariaLabel,
  children,
  initialFocusRef,
  closeOnEscape = true,
  closeOnOutsideClick = true,
  closeOnWindowBlur = true,
  restoreFocus = true,
  width = 680,
  className,
  style,
}: AppSpotlightSurfaceProps) {
  const surfaceRef = useRef<HTMLDivElement | null>(null)
  const restoreFocusRef = useRef<HTMLElement | null>(null)
  const restoreFocusEnabledRef = useRef(restoreFocus)
  const wasOpenRef = useRef(false)
  const [rendered, setRendered] = useState(open)
  const overlayHost = useAppOverlayHost()
  const overlayTree = useOverlayTree(open, surfaceRef)
  const exiting = rendered && !open

  if (open && !rendered) setRendered(true)

  useEffect(() => {
    if (open || !rendered) return
    const timer = window.setTimeout(() => {
      setRendered(false)
    }, EXIT_DURATION)
    return () => window.clearTimeout(timer)
  }, [open, rendered])

  useEffect(() => {
    restoreFocusEnabledRef.current = restoreFocus
  }, [restoreFocus])

  useLayoutEffect(() => {
    if (open && !wasOpenRef.current) {
      restoreFocusRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null
    }

    if (open) {
      const focusTarget =
        initialFocusRef?.current ??
        getFocusableElements(surfaceRef.current)[0] ??
        surfaceRef.current
      focusTarget?.focus({ preventScroll: true })
    }

    if (!open && wasOpenRef.current && restoreFocus) {
      restoreFocusRef.current?.focus({ preventScroll: true })
    }

    wasOpenRef.current = open
  }, [initialFocusRef, open, restoreFocus])

  useEffect(
    () => () => {
      if (wasOpenRef.current && restoreFocusEnabledRef.current) {
        restoreFocusRef.current?.focus({ preventScroll: true })
      }
    },
    [],
  )

  useOverlayDismiss({
    open,
    overlayRef: surfaceRef,
    onDismiss: () => onOpenChange(false),
    closeOnEscape,
    closeOnOutsidePointerDown: closeOnOutsideClick,
    closeOnResize: false,
    closeOnExternalScroll: false,
    closeOnWindowBlur,
    isInsideBranch: overlayTree.isInsideBranch,
    isTopMost: overlayTree.isTopMost,
  })

  const surfaceStyle = useMemo(
    () =>
      ({
        '--app-spotlight-width':
          typeof width === 'number' ? `${width}px` : width,
        ...style,
      }) as CSSProperties,
    [style, width],
  )

  if ((!rendered && !open) || typeof document === 'undefined') return null

  const portalHost = overlayHost?.parentElement ?? document.body
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab' || event.defaultPrevented) return
    const focusable = getFocusableElements(surfaceRef.current)
    if (focusable.length === 0) {
      event.preventDefault()
      surfaceRef.current?.focus({ preventScroll: true })
      return
    }

    const first = focusable[0]
    const last = focusable.at(-1)!
    const active = document.activeElement
    if (
      event.shiftKey &&
      (active === first || !surfaceRef.current?.contains(active))
    ) {
      event.preventDefault()
      last.focus({ preventScroll: true })
    } else if (
      !event.shiftKey &&
      (active === last || !surfaceRef.current?.contains(active))
    ) {
      event.preventDefault()
      first.focus({ preventScroll: true })
    }
  }

  return createPortal(
    <div
      aria-hidden={exiting || undefined}
      className={[
        'app-spotlight-layer',
        exiting ? 'app-spotlight-layer--exit' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      inert={exiting ? true : undefined}
    >
      <OverlayParentContext.Provider value={overlayTree.overlayId}>
        <div
          aria-label={ariaLabel}
          aria-modal="true"
          className={[
            'app-spotlight-surface',
            exiting ? 'app-spotlight-surface--exit' : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          onKeyDown={handleKeyDown}
          ref={surfaceRef}
          role="dialog"
          style={{
            ...(portalHost === document.body
              ? OVERLAY_SURFACE_FALLBACK_STYLE
              : undefined),
            ...surfaceStyle,
          }}
          tabIndex={-1}
        >
          {children}
        </div>
      </OverlayParentContext.Provider>
    </div>,
    portalHost,
  )
}
