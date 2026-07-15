import {
  cloneElement,
  useId,
  useRef,
  type CSSProperties,
  type ReactElement,
  type Ref,
} from 'react'
import { createPortal } from 'react-dom'
import { useAppOverlayHost } from '../overlay/AppOverlayHostContext'
import { OVERLAY_SURFACE_FALLBACK_STYLE } from '../overlay/surfaceFallback'
import { getElementRef, useMergedRefs } from '../overlay/trigger'
import { useAnchoredOverlayPosition } from '../overlay/useAnchoredOverlayPosition'
import { useOverlayDismiss } from '../overlay/useOverlayDismiss'
import type { AppTeachingTipAction, AppTeachingTipProps } from './types'
import './AppTeachingTip.css'

const TEACHING_TIP_GAP = 8
const TEACHING_TIP_VIEWPORT_PADDING = 12

interface TeachingTipTriggerProps {
  'aria-describedby'?: string
  'aria-expanded'?: boolean
  ref?: Ref<HTMLElement>
}

function describedBy(original: string | undefined, id: string | null) {
  return [original, id].filter(Boolean).join(' ') || undefined
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path d="M3.15 3.15a.5.5 0 0 1 .7 0L8 7.29l4.15-4.14a.5.5 0 0 1 .7.7L8.71 8l4.14 4.15a.5.5 0 0 1-.7.7L8 8.71l-4.15 4.14a.5.5 0 0 1-.7-.7L7.29 8 3.15 3.85a.5.5 0 0 1 0-.7Z" />
    </svg>
  )
}

export function AppTeachingTip({
  ariaLabel = 'Teaching tip',
  children,
  className,
  closeOnOutsidePointerDown = true,
  content,
  dismissible = true,
  maxWidth = 360,
  onOpenChange,
  open,
  placement = 'right',
  primaryAction,
  secondaryAction,
  title,
}: AppTeachingTipProps) {
  const triggerRef = useRef<HTMLElement | null>(null)
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const overlayHost = useAppOverlayHost()
  const tipId = useId()
  const titleId = useId()
  const contentId = useId()
  const resolvedMaxWidth = Math.max(0, maxWidth)
  const child = children as ReactElement<TeachingTipTriggerProps>
  const position = useAnchoredOverlayPosition({
    open,
    triggerRef,
    overlayRef,
    preferredPlacement: placement,
    gap: TEACHING_TIP_GAP,
    viewportPadding: TEACHING_TIP_VIEWPORT_PADDING,
    maxWidth: resolvedMaxWidth,
    dependencies: [title, content, primaryAction?.label, secondaryAction?.label],
  })

  const close = () => onOpenChange(false)
  const restoreTriggerFocus = () =>
    triggerRef.current?.focus({ preventScroll: true })
  const closeAndRestoreFocus = () => {
    close()
    restoreTriggerFocus()
  }
  const runAction = (action: AppTeachingTipAction) => {
    action.onClick()
    closeAndRestoreFocus()
  }

  useOverlayDismiss({
    open,
    triggerRef,
    overlayRef,
    onDismiss: close,
    closeOnOutsidePointerDown,
    restoreFocus: true,
  })

  const childRef = getElementRef(child)
  const mergedRef = useMergedRefs(childRef, triggerRef)
  const trigger = cloneElement(child, {
    ref: mergedRef,
    'aria-describedby': describedBy(
      child.props['aria-describedby'],
      open ? contentId : null,
    ),
    'aria-expanded': open,
  })

  if (!open || typeof document === 'undefined') {
    return trigger
  }

  const tipClassName = ['app-teaching-tip', className]
    .filter(Boolean)
    .join(' ')

  return (
    <>
      {trigger}
      {createPortal(
        <div
          aria-describedby={contentId}
          aria-label={title ? undefined : ariaLabel}
          aria-labelledby={title ? titleId : undefined}
          aria-modal="false"
          className={tipClassName}
          data-placement={position.placement}
          id={tipId}
          ref={overlayRef}
          role="dialog"
          style={{
            ...(overlayHost ? undefined : OVERLAY_SURFACE_FALLBACK_STYLE),
            '--app-teaching-tip-max-width': `${resolvedMaxWidth}px`,
            left: position.x,
            maxHeight: position.measured ? position.maxHeight : undefined,
            maxWidth: position.measured ? position.maxWidth : undefined,
            pointerEvents: position.measured ? undefined : 'none',
            top: position.y,
            visibility: position.measured ? 'visible' : 'hidden',
          } as CSSProperties}
        >
          {title || dismissible ? (
            <div className="app-teaching-tip__header">
              {title ? (
                <div className="app-teaching-tip__title" id={titleId}>
                  {title}
                </div>
              ) : (
                <span />
              )}
              {dismissible ? (
                <button
                  aria-label="Close"
                  className="app-teaching-tip__close"
                  onClick={closeAndRestoreFocus}
                  type="button"
                >
                  <CloseIcon />
                </button>
              ) : null}
            </div>
          ) : null}
          <div className="app-teaching-tip__content" id={contentId}>
            {content}
          </div>
          {primaryAction || secondaryAction ? (
            <div className="app-teaching-tip__actions">
              {secondaryAction ? (
                <button
                  className="app-teaching-tip__action app-teaching-tip__action--secondary"
                  onClick={() => runAction(secondaryAction)}
                  type="button"
                >
                  {secondaryAction.label}
                </button>
              ) : null}
              {primaryAction ? (
                <button
                  className="app-teaching-tip__action app-teaching-tip__action--primary"
                  onClick={() => runAction(primaryAction)}
                  type="button"
                >
                  {primaryAction.label}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>,
        overlayHost ?? document.body,
      )}
    </>
  )
}
