import {
  cloneElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  version as reactVersion,
  type CSSProperties,
  type FocusEventHandler,
  type KeyboardEventHandler,
  type PointerEventHandler,
  type ReactElement,
  type Ref,
  type RefCallback,
} from 'react'
import { createPortal } from 'react-dom'
import { useAppOverlayHost } from '../overlay/AppOverlayHostContext'
import { useAnchoredOverlayPosition } from '../overlay/useAnchoredOverlayPosition'
import { useOverlayDismiss } from '../overlay/useOverlayDismiss'
import type { AppTooltipProps } from './types'
import './AppTooltip.css'

const TOOLTIP_GAP = 6
const TOOLTIP_VIEWPORT_PADDING = 8
const REACT_MAJOR_VERSION = Number.parseInt(
  reactVersion.split('.')[0] ?? '19',
  10,
)
const BODY_FALLBACK_STYLE: CSSProperties = {
  color: '#1f1f1f',
  background: 'rgba(249, 249, 249, 0.96)',
  borderColor: 'rgba(0, 0, 0, 0.12)',
  boxShadow: '0 6px 18px rgba(0, 0, 0, 0.16)',
}
const NATIVE_DISABLED_ELEMENTS = new Set([
  'button',
  'fieldset',
  'input',
  'option',
  'select',
  'textarea',
])

interface TooltipTriggerProps {
  'aria-describedby'?: string
  disabled?: boolean
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

function elementRef(element: ReactElement<TooltipTriggerProps>) {
  return REACT_MAJOR_VERSION >= 19
    ? element.props.ref
    : (element as unknown as { ref?: Ref<HTMLElement> }).ref
}

function setRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') {
    return ref(value)
  }

  if (ref) {
    ;(ref as { current: T | null }).current = value
  }
}

function useMergedRefs<T>(
  firstRef: Ref<T> | undefined,
  secondRef: Ref<T> | undefined,
): RefCallback<T> {
  return useCallback((value) => {
    const refs = [firstRef, secondRef]
    const cleanups = refs.map((ref) => setRef(ref, value))

    if (REACT_MAJOR_VERSION < 19) {
      return
    }

    return () => {
      refs.forEach((ref, index) => {
        const cleanup = cleanups[index]

        if (typeof cleanup === 'function') {
          cleanup()
        } else {
          setRef(ref, null)
        }
      })
    }
  }, [firstRef, secondRef])
}

function describedBy(original: string | undefined, tooltipId: string | null) {
  return [original, tooltipId].filter(Boolean).join(' ') || undefined
}

export function AppTooltip({
  content,
  children,
  placement = 'top',
  delay = 500,
  disabled = false,
  maxWidth = 320,
  className,
}: AppTooltipProps) {
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

  useEffect(() => {
    if (!open || typeof document === 'undefined') {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) {
        event.preventDefault()
        closeTooltip()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [closeTooltip, open])

  useOverlayDismiss({
    open,
    triggerRef,
    overlayRef,
    onDismiss: closeTooltip,
    closeOnEscape: false,
    restoreFocus: false,
  })

  const childRef = elementRef(child)
  const mergedRef = useMergedRefs(childRef, triggerRef)
  const wrapperRef = useMergedRefs<HTMLElement>(undefined, triggerRef)
  const mergedDescription = describedBy(
    child.props['aria-describedby'],
    open ? tooltipId : null,
  )
  const handlePointerEnter: PointerEventHandler<HTMLElement> = (event) => {
    child.props.onPointerEnter?.(event)
    if (!event.defaultPrevented) {
      scheduleOpen()
    }
  }
  const handlePointerLeave: PointerEventHandler<HTMLElement> = (event) => {
    child.props.onPointerLeave?.(event)
    if (!event.defaultPrevented) {
      cancelOpen()
      setHovered(false)
    }
  }
  const handleFocus: FocusEventHandler<HTMLElement> = (event) => {
    child.props.onFocus?.(event)
    if (!event.defaultPrevented && canShow) {
      cancelOpen()
      setFocused(true)
    }
  }
  const handleBlur: FocusEventHandler<HTMLElement> = (event) => {
    child.props.onBlur?.(event)
    if (!event.defaultPrevented) {
      setFocused(false)
    }
  }
  const handleKeyDown: KeyboardEventHandler<HTMLElement> = (event) => {
    child.props.onKeyDown?.(event)
    if (!event.defaultPrevented && event.key === 'Escape') {
      event.preventDefault()
      closeTooltip()
    }
  }
  const nativeDisabled =
    typeof child.type === 'string' &&
    NATIVE_DISABLED_ELEMENTS.has(child.type) &&
    child.props.disabled === true
  /* eslint-disable react-hooks/refs -- cloneElement receives a ref callback;
   * the callback reads refs only during React's commit phase. */
  const trigger = nativeDisabled ? (
    <span
      ref={wrapperRef}
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
      'aria-describedby': mergedDescription,
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
        <div
          ref={overlayRef}
          className={tooltipClassName}
          data-placement={position.placement}
          id={tooltipId}
          role="tooltip"
          style={{
            ...(overlayHost ? undefined : BODY_FALLBACK_STYLE),
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
        </div>,
        overlayHost ?? document.body,
      )}
    </>
  )
}
