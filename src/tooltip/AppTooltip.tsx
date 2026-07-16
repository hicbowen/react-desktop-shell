import {
  cloneElement,
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type AriaAttributes,
  type CSSProperties,
  type FocusEventHandler,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type PointerEventHandler,
  type ReactElement,
  type Ref,
} from 'react'
import { createPortal } from 'react-dom'
import { useAppOverlayHost } from '../overlay/AppOverlayHostContext'
import { OVERLAY_SURFACE_FALLBACK_STYLE } from '../overlay/surfaceFallback'
import {
  composeEventHandlers,
  getElementRef,
  useMergedRefs,
} from '../overlay/trigger'
import { useAnchoredOverlayPosition } from '../overlay/useAnchoredOverlayPosition'
import { useOverlayDismiss } from '../overlay/useOverlayDismiss'
import {
  OverlayParentContext,
  useOverlayTree,
} from '../overlay/OverlayTreeContext'
import type { AppTooltipProps } from './types'
import './AppTooltip.css'

const TOOLTIP_GAP = 6
const TOOLTIP_VIEWPORT_PADDING = 8
const NATIVE_DISABLED_ELEMENTS = new Set([
  'button',
  'fieldset',
  'input',
  'option',
  'select',
  'textarea',
])

interface TooltipTriggerProps {
  'aria-controls'?: string
  'aria-describedby'?: string
  'aria-expanded'?: boolean
  'aria-haspopup'?: AriaAttributes['aria-haspopup']
  disabled?: boolean
  onClick?: MouseEventHandler<HTMLElement>
  onPointerEnter?: PointerEventHandler<HTMLElement>
  onPointerLeave?: PointerEventHandler<HTMLElement>
  onFocus?: FocusEventHandler<HTMLElement>
  onBlur?: FocusEventHandler<HTMLElement>
  onKeyDown?: KeyboardEventHandler<HTMLElement>
  ref?: Ref<HTMLElement>
}

function hasContent(content: AppTooltipProps['content']) {
  return (
    content !== null &&
    content !== undefined &&
    content !== false &&
    content !== ''
  )
}

function describedBy(original: string | undefined, tooltipId: string | null) {
  return [original, tooltipId].filter(Boolean).join(' ') || undefined
}

function AppTooltipInner({
  content,
  children,
  placement = 'top',
  delay = 500,
  disabled = false,
  maxWidth = 320,
  className,
  ...triggerProps
}: AppTooltipProps & TooltipTriggerProps, forwardedRef: Ref<HTMLElement>) {
  const canShow = !disabled && hasContent(content)
  const resolvedMaxWidth = Math.max(0, maxWidth)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [previousCanShow, setPreviousCanShow] = useState(canShow)
  const openTimerRef = useRef<number | null>(null)
  const triggerRef = useRef<HTMLElement | null>(null)
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const overlayHost = useAppOverlayHost()
  const tooltipId = useId()
  const child = children as ReactElement<TooltipTriggerProps>

  if (previousCanShow !== canShow) {
    setPreviousCanShow(canShow)
    setHovered(false)
    setFocused(false)
  }

  const open = canShow && (hovered || focused)
  const overlayTree = useOverlayTree(open, overlayRef)
  const position = useAnchoredOverlayPosition({
    open,
    triggerRef,
    overlayRef,
    preferredPlacement: placement,
    gap: TOOLTIP_GAP,
    viewportPadding: TOOLTIP_VIEWPORT_PADDING,
    maxWidth: resolvedMaxWidth,
    dependencies: [content],
  })

  const cancelOpen = useCallback(() => {
    if (openTimerRef.current !== null && typeof window !== 'undefined') {
      window.clearTimeout(openTimerRef.current)
      openTimerRef.current = null
    }
  }, [])

  const closeTooltip = useCallback(() => {
    cancelOpen()
    setHovered(false)
    setFocused(false)
  }, [cancelOpen])

  const scheduleOpen = useCallback(() => {
    cancelOpen()

    if (!canShow || typeof window === 'undefined') {
      return
    }

    if (delay <= 0) {
      setHovered(true)
      return
    }

    openTimerRef.current = window.setTimeout(() => {
      openTimerRef.current = null
      setHovered(true)
    }, delay)
  }, [cancelOpen, canShow, delay])

  useEffect(() => {
    if (!canShow) {
      cancelOpen()
    }
  }, [canShow, cancelOpen])

  useEffect(() => cancelOpen, [cancelOpen])

  useOverlayDismiss({
    open,
    triggerRef,
    overlayRef,
    onDismiss: closeTooltip,
    closeOnEscape: true,
    restoreFocus: false,
    isInsideBranch: overlayTree.isInsideBranch,
    isTopMost: overlayTree.isTopMost,
  })

  const childRef = getElementRef(child)
  const forwardedChildRef = useMergedRefs(childRef, forwardedRef)
  const mergedRef = useMergedRefs(forwardedChildRef, triggerRef)
  const forwardedWrapperRef = useMergedRefs<HTMLElement>(
    forwardedRef,
    triggerRef,
  )
  const mergedDescription = describedBy(
    child.props['aria-describedby'],
    open ? tooltipId : null,
  )
  /* eslint-disable react-hooks/refs -- composed event callbacks and cloned refs
   * only access refs after React dispatches an event or during commit. */
  const handlePointerEnter = composeEventHandlers(
    child.props.onPointerEnter,
    composeEventHandlers(triggerProps.onPointerEnter, scheduleOpen),
  )
  const handlePointerLeave = composeEventHandlers(
    child.props.onPointerLeave,
    composeEventHandlers(triggerProps.onPointerLeave, () => {
      cancelOpen()
      setHovered(false)
    }),
  )
  const handleFocus = composeEventHandlers(
    child.props.onFocus,
    composeEventHandlers(triggerProps.onFocus, () => {
      if (!canShow) {
        return
      }

      cancelOpen()
      setFocused(true)
    }),
  )
  const handleBlur = composeEventHandlers(
    child.props.onBlur,
    composeEventHandlers(triggerProps.onBlur, () => setFocused(false)),
  )
  const handleClick = composeEventHandlers(
    child.props.onClick,
    composeEventHandlers(triggerProps.onClick, closeTooltip),
  )
  const handleKeyDown = composeEventHandlers(
    child.props.onKeyDown,
    composeEventHandlers(triggerProps.onKeyDown, (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeTooltip()
      }
    }),
  )
  const nativeDisabled =
    typeof child.type === 'string' &&
    NATIVE_DISABLED_ELEMENTS.has(child.type) &&
    child.props.disabled === true
  const trigger = nativeDisabled ? (
    <span
      ref={forwardedWrapperRef}
      className="app-tooltip__trigger-wrapper"
      onPointerEnter={scheduleOpen}
      onPointerLeave={() => {
        cancelOpen()
        setHovered(false)
      }}
    >
      {cloneElement(child, { 'aria-describedby': mergedDescription })}
    </span>
  ) : (
    cloneElement(child, {
      ref: mergedRef,
      'aria-controls':
        triggerProps['aria-controls'] ?? child.props['aria-controls'],
      'aria-describedby': mergedDescription,
      'aria-expanded':
        triggerProps['aria-expanded'] ?? child.props['aria-expanded'],
      'aria-haspopup':
        triggerProps['aria-haspopup'] ?? child.props['aria-haspopup'],
      onClick: handleClick,
      onPointerEnter: handlePointerEnter,
      onPointerLeave: handlePointerLeave,
      onFocus: handleFocus,
      onBlur: handleBlur,
      onKeyDown: handleKeyDown,
    })
  )
  /* eslint-enable react-hooks/refs */
  const tooltipClassName = ['app-tooltip', className]
    .filter(Boolean)
    .join(' ')

  if (!open || typeof document === 'undefined') {
    return trigger
  }

  return (
    <>
      {trigger}
      {createPortal(
        <OverlayParentContext.Provider value={overlayTree.overlayId}>
          <div
          ref={overlayRef}
          className={tooltipClassName}
          data-placement={position.placement}
          id={tooltipId}
          role="tooltip"
          style={{
            ...(overlayHost ? undefined : OVERLAY_SURFACE_FALLBACK_STYLE),
            '--app-tooltip-max-width': `${resolvedMaxWidth}px`,
            left: position.x,
            maxHeight: position.measured ? position.maxHeight : undefined,
            maxWidth: position.measured ? position.maxWidth : undefined,
            pointerEvents: 'none',
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

export const AppTooltip = forwardRef<HTMLElement, AppTooltipProps>(
  AppTooltipInner,
)

AppTooltip.displayName = 'AppTooltip'
