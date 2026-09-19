import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useAppOverlayHost } from './AppOverlayHostContext'
import { OverlayParentContext } from './OverlayTreeContext'

/** Internal portal shared by anchored overlays so host and tree semantics stay aligned. */
export function AppOverlayPortal({
  children,
  parentId,
}: {
  children: ReactNode
  parentId: string
}) {
  const overlayHost = useAppOverlayHost()
  if (typeof document === 'undefined') return null

  return createPortal(
    <OverlayParentContext.Provider value={parentId}>
      {children}
    </OverlayParentContext.Provider>,
    overlayHost ?? document.body,
  )
}
