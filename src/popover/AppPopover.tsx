import {
  cloneElement,
  Fragment,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactElement,
  type Ref,
} from 'react'
import { createPortal } from 'react-dom'
import { useAppOverlayHost } from '../overlay/AppOverlayHostContext'
import { composeEventHandlers, getElementRef, useMergedRefs } from '../overlay/trigger'
import { useAnchoredOverlayPosition } from '../overlay/useAnchoredOverlayPosition'
import {
  useOverlayDismiss,
  type OverlayDismissReason,
} from '../overlay/useOverlayDismiss'
import { OVERLAY_SURFACE_FALLBACK_STYLE } from '../overlay/surfaceFallback'
import {
  OverlayParentContext,
  useOverlayTree,
} from '../overlay/OverlayTreeContext'
import type { AppPopoverProps } from './types'
import './AppPopover.css'

interface TriggerProps {
  onClick?: (event: MouseEvent<HTMLElement>) => void
  'aria-controls'?: string
  'aria-expanded'?: boolean
  'aria-haspopup'?: true
  ref?: Ref<HTMLElement>
}

type PopoverDismissReason =
  | 'escape'
  | 'outside-pointer'
  | 'trigger'
  | 'controlled'

export function AppPopover({
  ariaLabel,
  children,
  className,
  closeOnEscape = true,
  closeOnOutsideClick = true,
  defaultOpen = false,
  initialFocusRef,
  matchTriggerWidth = false,
  offset = 6,
  onOpenChange,
  open,
  placement = 'bottom-start',
  style,
  trigger,
}: AppPopoverProps) {
  const controlled = open !== undefined
  const [internal, setInternal] = useState(defaultOpen)
  const visible = controlled ? open : internal
  const triggerRef = useRef<HTMLElement | null>(null)
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const [triggerWidth, setTriggerWidth] = useState<number>()
  const wasOpen = useRef(visible)
  const visibleRef = useRef(visible)
  const lastCloseReasonRef = useRef<PopoverDismissReason | null>(null)
  const closeRequestRef = useRef(0)
  const overlayHost = useAppOverlayHost()
  const id = useId()
  const overlayTree = useOverlayTree(visible, overlayRef)

  const setVisible = (
    next: boolean,
    reason: PopoverDismissReason = 'controlled',
  ) => {
    if (!next) {
      lastCloseReasonRef.current = reason
    } else {
      lastCloseReasonRef.current = null
    }
    if (!controlled) setInternal(next)
    onOpenChange?.(next)
    if (controlled && !next) {
      const request = ++closeRequestRef.current
      queueMicrotask(() => {
        if (closeRequestRef.current === request && visibleRef.current) {
          lastCloseReasonRef.current = null
        }
      })
    }
  }
  const position = useAnchoredOverlayPosition({
    open: visible,
    triggerRef,
    overlayRef,
    preferredPlacement: placement,
    gap: Math.max(0, offset),
    viewportPadding: 10,
    dependencies: [matchTriggerWidth, typeof children === 'string' ? children : null],
  })

  useLayoutEffect(() => {
    visibleRef.current = visible
  }, [visible])

  useEffect(() => {
    if (visible && matchTriggerWidth) {
      setTriggerWidth(triggerRef.current?.getBoundingClientRect().width)
    } else if (!visible) {
      setTriggerWidth(undefined)
    }
  }, [matchTriggerWidth, visible])

  useEffect(() => {
    if (visible && initialFocusRef?.current) {
      requestAnimationFrame(() => initialFocusRef.current?.focus({ preventScroll: true }))
    }
    if (wasOpen.current && !visible) {
      if (lastCloseReasonRef.current === 'escape') {
        triggerRef.current?.focus({ preventScroll: true })
      }
      lastCloseReasonRef.current = null
    }
    wasOpen.current = visible
  }, [initialFocusRef, visible])

  useOverlayDismiss({
    open: visible,
    triggerRef,
    overlayRef,
    onDismiss: (reason: OverlayDismissReason) => setVisible(
      false,
      reason === 'escape' ? 'escape' : 'outside-pointer',
    ),
    closeOnEscape,
    closeOnOutsidePointerDown: closeOnOutsideClick,
    closeOnExternalScroll: false,
    closeOnResize: false,
    closeOnWindowBlur: false,
    isInsideBranch: overlayTree.isInsideBranch,
    isTopMost: overlayTree.isTopMost,
  })

  const child = trigger as ReactElement<TriggerProps>
  if (
    import.meta.env.DEV &&
    (
      child.type === Fragment ||
      (
        typeof child.type === 'function' &&
        !(child.type as { prototype?: { isReactComponent?: unknown } }).prototype?.isReactComponent
      )
    )
  ) {
    console.warn('AppPopover trigger must be a ref-capable DOM element or forwardRef component.')
  }
  const mergedRef = useMergedRefs(getElementRef(child), triggerRef)
  const handleTriggerClick = () =>
    setVisible(!visible, visible ? 'trigger' : 'controlled')
  /* eslint-disable react-hooks/refs -- the composed callback only reads refs
   * after React dispatches the trigger click. */
  const renderedTrigger = cloneElement(child, {
    'aria-controls': visible ? id : undefined,
    'aria-expanded': visible,
    'aria-haspopup': true,
    onClick: composeEventHandlers(
      child.props.onClick,
      handleTriggerClick,
    ),
    ref: mergedRef,
  })
  /* eslint-enable react-hooks/refs */

  if (!visible || typeof document === 'undefined') return renderedTrigger

  return <>
    {renderedTrigger}
    {createPortal(
      <OverlayParentContext.Provider value={overlayTree.overlayId}>
        <div
        aria-label={ariaLabel}
        className={['app-popover', className].filter(Boolean).join(' ')}
        data-placement={position.placement}
        id={id}
        ref={overlayRef}
        role={ariaLabel ? 'region' : undefined}
        style={{
          ...(overlayHost ? undefined : OVERLAY_SURFACE_FALLBACK_STYLE),
          ...style,
          left: position.x,
          maxHeight: position.measured ? position.maxHeight : undefined,
          maxWidth: position.measured ? position.maxWidth : undefined,
          minWidth: matchTriggerWidth ? triggerWidth : undefined,
          pointerEvents: position.measured ? 'auto' : 'none',
          top: position.y,
          visibility: position.measured ? 'visible' : 'hidden',
        } as CSSProperties}
      >
        {children}
        </div>
      </OverlayParentContext.Provider>,
      overlayHost ?? document.body,
    )}
  </>
}
