import { useEffect, useId, useRef } from 'react'
import { useAppDialogRegistry } from './AppDialogContext'
import type { AppDialogProps } from './types'

export function AppDialog(props: AppDialogProps) {
  const {
    open,
    onOpenChange,
    title,
    description,
    children,
    actions,
    closeOnEscape,
    closeOnOverlayClick,
    initialFocus,
    width,
    className,
  } = props
  const registry = useAppDialogRegistry()
  const reactId = useId()
  const id = `app-dialog-${reactId.replace(/:/g, '')}`
  const restoreFocusRef = useRef<HTMLElement | null>(null)
  const wasOpenRef = useRef(false)

  useEffect(() => {
    if (!registry) {
      throw new Error('AppDialog must be used within AppShell')
    }

    if (!open) {
      registry.unregister(id)
      wasOpenRef.current = false
      return
    }

    if (!wasOpenRef.current) {
      restoreFocusRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null
    }

    wasOpenRef.current = true

    registry.register({
      id,
      open,
      onOpenChange,
      title,
      description,
      children,
      actions,
      closeOnEscape,
      closeOnOverlayClick,
      initialFocus,
      width,
      className,
      restoreFocusElement: restoreFocusRef.current,
    })
  }, [
    actions,
    children,
    className,
    closeOnEscape,
    closeOnOverlayClick,
    description,
    id,
    initialFocus,
    onOpenChange,
    open,
    registry,
    title,
    width,
  ])

  useEffect(
    () => () => {
      registry?.unregister(id)
    },
    [id, registry],
  )

  return null
}
