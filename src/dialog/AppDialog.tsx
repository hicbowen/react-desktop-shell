import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AppOverlayHostContext } from '../overlay/AppOverlayHostContext'
import {
  useAppDialogRegistry,
  type AppDialogPortalHosts,
} from './AppDialogContext'
import type { AppDialogProps } from './types'

function createPortalHosts(): AppDialogPortalHosts | null {
  if (typeof document === 'undefined') {
    return null
  }

  const createHost = (slot: string) => {
    const host = document.createElement('div')
    host.dataset.dialogSlot = slot
    host.style.display = 'contents'
    return host
  }

  return {
    title: createHost('title'),
    description: createHost('description'),
    content: createHost('content'),
    actions: createHost('actions'),
    overlay: createHost('overlay'),
  }
}

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
  const [portalHosts] = useState(createPortalHosts)
  const [portalState, setPortalState] = useState({ open, retained: open })

  if (portalState.open !== open) {
    setPortalState({
      open,
      retained: open || portalState.retained,
    })
  }

  const handleExited = useCallback(() => {
    setPortalState((current) =>
      current.open ? current : { ...current, retained: false },
    )
  }, [])

  const hasTitle = Boolean(title)
  const hasDescription = Boolean(description)
  const hasContent = Boolean(children)
  const hasActions = Boolean(actions)

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
      closeOnEscape,
      closeOnOverlayClick,
      initialFocus,
      width,
      className,
      restoreFocusElement: restoreFocusRef.current,
      onExited: handleExited,
      portalHosts: portalHosts ?? undefined,
      hasTitle,
      hasDescription,
      hasContent,
      hasActions,
    })
  }, [
    className,
    closeOnEscape,
    closeOnOverlayClick,
    handleExited,
    hasActions,
    hasContent,
    hasDescription,
    hasTitle,
    id,
    initialFocus,
    onOpenChange,
    open,
    portalHosts,
    registry,
    width,
  ])

  useEffect(
    () => () => {
      registry?.unregister(id)
    },
    [id, registry],
  )

  if (!portalState.retained || !portalHosts) {
    return null
  }

  return (
    <AppOverlayHostContext.Provider value={portalHosts.overlay}>
      {hasTitle ? createPortal(title, portalHosts.title, 'title') : null}
      {hasDescription
        ? createPortal(description, portalHosts.description, 'description')
        : null}
      {hasContent
        ? createPortal(children, portalHosts.content, 'content')
        : null}
      {hasActions
        ? createPortal(actions, portalHosts.actions, 'actions')
        : null}
    </AppOverlayHostContext.Provider>
  )
}
