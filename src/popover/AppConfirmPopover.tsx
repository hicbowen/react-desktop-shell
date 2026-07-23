import { cloneElement, useId, useRef, useState } from 'react'
import type { MouseEvent, ReactElement, Ref } from 'react'
import { AppButton } from '../button'
import { useAppLocale } from '../localization/useAppLocale'
import { getElementRef, useMergedRefs } from '../overlay/trigger'
import { AppPopover } from './AppPopover'
import type { AppConfirmPopoverProps } from './types'
import './AppConfirmPopover.css'

type ConfirmTriggerProps = {
  onClick?: (event: MouseEvent<HTMLElement>) => void
  ref?: Ref<HTMLElement>
}

export function AppConfirmPopover({
  cancelText,
  className,
  confirmAppearance = 'primary',
  confirmText,
  defaultOpen = false,
  description,
  offset,
  onCancel,
  onConfirm,
  onConfirmError,
  onOpenChange,
  open,
  placement = 'bottom-start',
  style,
  title,
  trigger,
}: AppConfirmPopoverProps) {
  const controlled = open !== undefined
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const [confirming, setConfirming] = useState(false)
  const visible = controlled ? open : internalOpen
  const cancelRef = useRef<HTMLButtonElement>(null)
  const triggerRef = useRef<HTMLElement>(null)
  const titleId = useId()
  const descriptionId = useId()
  const { messages } = useAppLocale()
  const triggerElement = trigger as ReactElement<ConfirmTriggerProps>
  const mergedTriggerRef = useMergedRefs(
    getElementRef(triggerElement),
    triggerRef,
  )

  const restoreTriggerFocus = () => {
    requestAnimationFrame(() => {
      triggerRef.current?.focus({ preventScroll: true })
    })
  }

  const setVisible = (next: boolean) => {
    if (!controlled) setInternalOpen(next)
    onOpenChange?.(next)
    if (!next) restoreTriggerFocus()
  }

  const cancel = () => {
    if (confirming) return
    onCancel?.()
    setVisible(false)
  }

  const confirm = async () => {
    if (confirming) return
    setConfirming(true)
    try {
      await onConfirm()
      setVisible(false)
    } catch (error) {
      onConfirmError?.(error)
    } finally {
      setConfirming(false)
    }
  }

  const triggerWithRef = cloneElement(triggerElement, {
    ref: mergedTriggerRef,
  })
  const guardedTrigger = confirming
    ? cloneElement(triggerWithRef, {
        onClick: (event) => {
          event.preventDefault()
          event.stopPropagation()
        },
      })
    : triggerWithRef

  return (
    <AppPopover
      className={['app-confirm-popover', className].filter(Boolean).join(' ')}
      closeOnEscape={!confirming}
      closeOnOutsideClick={!confirming}
      initialFocusRef={cancelRef}
      offset={offset}
      onOpenChange={(next) => {
        if (!next) {
          cancel()
        } else {
          setVisible(true)
        }
      }}
      open={visible}
      placement={placement}
      style={style}
      trigger={guardedTrigger}
    >
      <div
        aria-describedby={description ? descriptionId : undefined}
        aria-labelledby={titleId}
        className="app-confirm-popover__dialog"
        role="dialog"
      >
        <strong className="app-confirm-popover__title" id={titleId}>
          {title}
        </strong>
        {description ? (
          <div
            className="app-confirm-popover__description"
            id={descriptionId}
          >
            {description}
          </div>
        ) : null}
        <div className="app-confirm-popover__actions">
          <AppButton
            disabled={confirming}
            onClick={cancel}
            ref={cancelRef}
            size="compact"
          >
            {cancelText ?? messages.common.cancel}
          </AppButton>
          <AppButton
            appearance={confirmAppearance}
            loading={confirming}
            onClick={() => void confirm()}
            size="compact"
          >
            {confirmText ?? messages.common.confirm}
          </AppButton>
        </div>
      </div>
    </AppPopover>
  )
}
