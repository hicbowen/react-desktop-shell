import {
  cloneElement,
  forwardRef,
  Fragment,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type AriaAttributes,
  type CSSProperties,
  type FocusEventHandler,
  type MouseEventHandler,
  type PointerEventHandler,
  type ReactElement,
  type Ref,
} from 'react'
import { createPortal } from 'react-dom'
import { useAppOverlayHost } from '../overlay/AppOverlayHostContext'
import {
  OverlayParentContext,
  useOverlayTree,
} from '../overlay/OverlayTreeContext'
import { OVERLAY_SURFACE_FALLBACK_STYLE } from '../overlay/surfaceFallback'
import {
  composeEventHandlers,
  getElementRef,
  useMergedRefs,
} from '../overlay/trigger'
import { useAnchoredOverlayPosition } from '../overlay/useAnchoredOverlayPosition'
import {
  useOverlayDismiss,
  type OverlayDismissReason,
} from '../overlay/useOverlayDismiss'
import type { AppHoverCardProps } from './types'
import './AppHoverCard.css'

const HOVER_CARD_VIEWPORT_PADDING = 10

interface HoverCardTriggerProps {
  'aria-controls'?: string
  'aria-expanded'?: boolean
  'aria-haspopup'?: AriaAttributes['aria-haspopup']
  onBlur?: FocusEventHandler<HTMLElement>
  onClick?: MouseEventHandler<HTMLElement>
  onFocus?: FocusEventHandler<HTMLElement>
  onPointerEnter?: PointerEventHandler<HTMLElement>
  onPointerLeave?: PointerEventHandler<HTMLElement>
  ref?: Ref<HTMLElement>
}

function hasContent(content: AppHoverCardProps['content']) {
  return (
    content !== null &&
    content !== undefined &&
    content !== false &&
    content !== ''
  )
}

function AppHoverCardInner(
  {
    ariaLabel,
    children,
    className,
    closeDelay = 200,
    content,
    defaultOpen = false,
    disabled = false,
    maxWidth = 360,
    offset = 8,
    onOpenChange,
    open,
    openDelay = 500,
    openOnClick = true,
    placement = 'bottom-start',
    style,
  }: AppHoverCardProps,
  forwardedRef: Ref<HTMLElement>,
) {
  const controlled = open !== undefined
  const canShow = !disabled && hasContent(content)
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const [previousCanShow, setPreviousCanShow] = useState(canShow)

  if (previousCanShow !== canShow) {
    setPreviousCanShow(canShow)
    if (!canShow && !controlled) setInternalOpen(false)
  }

  const visible = controlled ? Boolean(open) : internalOpen
  const resolvedOpen = canShow && visible
  const triggerRef = useRef<HTMLElement | null>(null)
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const openTimerRef = useRef<number | null>(null)
  const closeTimerRef = useRef<number | null>(null)
  const triggerHoveredRef = useRef(false)
  const surfaceHoveredRef = useRef(false)
  const pinnedRef = useRef(defaultOpen)
  const suppressFocusOpenRef = useRef(false)
  const visibleRef = useRef(resolvedOpen)
  const overlayHost = useAppOverlayHost()
  const hoverCardId = useId()
  const overlayTree = useOverlayTree(resolvedOpen, overlayRef)
  const resolvedMaxWidth = Math.max(0, maxWidth)
  const resolvedOpenDelay = Math.max(0, openDelay)
  const resolvedCloseDelay = Math.max(0, closeDelay)
  const child = children as ReactElement<HoverCardTriggerProps>
  const position = useAnchoredOverlayPosition({
    open: resolvedOpen,
    triggerRef,
    overlayRef,
    preferredPlacement: placement,
    gap: Math.max(0, offset),
    viewportPadding: HOVER_CARD_VIEWPORT_PADDING,
    maxWidth: resolvedMaxWidth,
    dependencies: [typeof content === 'string' ? content : null],
  })

  useLayoutEffect(() => {
    visibleRef.current = resolvedOpen
  }, [resolvedOpen])

  const clearOpenTimer = useCallback(() => {
    if (openTimerRef.current !== null && typeof window !== 'undefined') {
      window.clearTimeout(openTimerRef.current)
      openTimerRef.current = null
    }
  }, [])

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current !== null && typeof window !== 'undefined') {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }, [])

  const setVisible = useCallback(
    (next: boolean) => {
      if (visibleRef.current === next) return

      if (!controlled) {
        visibleRef.current = next
        setInternalOpen(next)
      }
      onOpenChange?.(next)
    },
    [controlled, onOpenChange],
  )

  const containsFocus = useCallback(() => {
    if (typeof document === 'undefined') return false
    const active = document.activeElement
    return Boolean(
      active &&
        (triggerRef.current?.contains(active) ||
          overlayRef.current?.contains(active)),
    )
  }, [])

  const closeIfIdle = useCallback(() => {
    closeTimerRef.current = null
    if (
      pinnedRef.current ||
      triggerHoveredRef.current ||
      surfaceHoveredRef.current ||
      containsFocus()
    ) {
      return
    }
    setVisible(false)
  }, [containsFocus, setVisible])

  const scheduleClose = useCallback(() => {
    clearOpenTimer()
    clearCloseTimer()
    if (pinnedRef.current || typeof window === 'undefined') return

    if (resolvedCloseDelay === 0) {
      closeIfIdle()
      return
    }
    closeTimerRef.current = window.setTimeout(
      closeIfIdle,
      resolvedCloseDelay,
    )
  }, [
    clearCloseTimer,
    clearOpenTimer,
    closeIfIdle,
    resolvedCloseDelay,
  ])

  const scheduleOpen = useCallback(() => {
    clearCloseTimer()
    clearOpenTimer()
    if (!canShow || visibleRef.current || typeof window === 'undefined') {
      return
    }

    if (resolvedOpenDelay === 0) {
      setVisible(true)
      return
    }
    openTimerRef.current = window.setTimeout(() => {
      openTimerRef.current = null
      if (triggerHoveredRef.current) setVisible(true)
    }, resolvedOpenDelay)
  }, [
    canShow,
    clearCloseTimer,
    clearOpenTimer,
    resolvedOpenDelay,
    setVisible,
  ])

  const closeCard = useCallback(() => {
    clearOpenTimer()
    clearCloseTimer()
    pinnedRef.current = false
    surfaceHoveredRef.current = false
    setVisible(false)
  }, [clearCloseTimer, clearOpenTimer, setVisible])

  useEffect(() => {
    if (!resolvedOpen) pinnedRef.current = false
  }, [resolvedOpen])

  useEffect(
    () => () => {
      clearOpenTimer()
      clearCloseTimer()
    },
    [clearCloseTimer, clearOpenTimer],
  )

  useOverlayDismiss({
    open: resolvedOpen,
    triggerRef,
    overlayRef,
    onDismiss: (reason: OverlayDismissReason) => {
      const restoreFocus =
        reason === 'escape' &&
        typeof document !== 'undefined' &&
        Boolean(overlayRef.current?.contains(document.activeElement))
      closeCard()
      if (restoreFocus) {
        suppressFocusOpenRef.current = true
        triggerRef.current?.focus({ preventScroll: true })
        suppressFocusOpenRef.current = false
      }
    },
    closeOnEscape: true,
    closeOnOutsidePointerDown: true,
    closeOnExternalScroll: false,
    closeOnResize: false,
    closeOnWindowBlur: true,
    restoreFocus: false,
    isInsideBranch: overlayTree.isInsideBranch,
    isTopMost: overlayTree.isTopMost,
  })

  const handleTriggerPointerEnter = () => {
    triggerHoveredRef.current = true
    scheduleOpen()
  }
  const handleTriggerPointerLeave = () => {
    triggerHoveredRef.current = false
    scheduleClose()
  }
  const handleTriggerFocus = () => {
    if (suppressFocusOpenRef.current) return
    clearOpenTimer()
    clearCloseTimer()
    if (canShow) setVisible(true)
  }
  const handleTriggerBlur = () => scheduleClose()
  const handleTriggerClick = () => {
    if (!canShow || !openOnClick) return
    clearOpenTimer()
    clearCloseTimer()

    if (pinnedRef.current) {
      pinnedRef.current = false
      setVisible(false)
      return
    }
    pinnedRef.current = true
    setVisible(true)
  }

  if (
    import.meta.env.DEV &&
    (
      child.type === Fragment ||
      (
        typeof child.type === 'function' &&
        !(child.type as { prototype?: { isReactComponent?: unknown } })
          .prototype?.isReactComponent
      )
    )
  ) {
    console.warn(
      'AppHoverCard trigger must be a ref-capable DOM element or forwardRef component.',
    )
  }

  const forwardedChildRef = useMergedRefs(
    getElementRef(child),
    forwardedRef,
  )
  const mergedRef = useMergedRefs(forwardedChildRef, triggerRef)
  /* eslint-disable react-hooks/refs -- cloned event callbacks and refs are
   * consumed after React commits the trigger element. */
  const trigger = cloneElement(child, {
    'aria-controls': resolvedOpen ? hoverCardId : child.props['aria-controls'],
    'aria-expanded': resolvedOpen,
    'aria-haspopup': ariaLabel ? 'dialog' : true,
    onBlur: composeEventHandlers(child.props.onBlur, handleTriggerBlur),
    onClick: composeEventHandlers(child.props.onClick, handleTriggerClick),
    onFocus: composeEventHandlers(child.props.onFocus, handleTriggerFocus),
    onPointerEnter: composeEventHandlers(
      child.props.onPointerEnter,
      handleTriggerPointerEnter,
    ),
    onPointerLeave: composeEventHandlers(
      child.props.onPointerLeave,
      handleTriggerPointerLeave,
    ),
    ref: mergedRef,
  })
  /* eslint-enable react-hooks/refs */

  if (!resolvedOpen || typeof document === 'undefined') return trigger

  return (
    <>
      {trigger}
      {createPortal(
        <OverlayParentContext.Provider value={overlayTree.overlayId}>
          <div
            aria-label={ariaLabel}
            aria-modal={ariaLabel ? 'false' : undefined}
            className={['app-hover-card', className]
              .filter(Boolean)
              .join(' ')}
            data-placement={position.placement}
            id={hoverCardId}
            onBlurCapture={scheduleClose}
            onFocusCapture={clearCloseTimer}
            onPointerEnter={() => {
              surfaceHoveredRef.current = true
              clearCloseTimer()
            }}
            onPointerLeave={() => {
              surfaceHoveredRef.current = false
              scheduleClose()
            }}
            ref={overlayRef}
            role={ariaLabel ? 'dialog' : undefined}
            style={{
              ...(overlayHost ? undefined : OVERLAY_SURFACE_FALLBACK_STYLE),
              ...style,
              '--app-hover-card-max-width': `${resolvedMaxWidth}px`,
              left: position.x,
              maxHeight: position.measured
                ? position.maxHeight
                : undefined,
              maxWidth: position.measured
                ? position.maxWidth
                : undefined,
              pointerEvents: position.measured ? 'auto' : 'none',
              top: position.y,
              visibility: position.measured ? 'visible' : 'hidden',
            } as CSSProperties}
          >
            {content}
          </div>
        </OverlayParentContext.Provider>,
        overlayHost ?? document.body,
      )}
    </>
  )
}

export const AppHoverCard = forwardRef<
  HTMLElement,
  AppHoverCardProps
>(AppHoverCardInner)
