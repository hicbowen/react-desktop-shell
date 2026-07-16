import type { AppContextMenuState } from '../context-menu/AppContextMenuLayer'
import { AppContextMenuLayer } from '../context-menu/AppContextMenuLayer'
import type { AppDialogRegistration } from '../dialog/AppDialogContext'
import { AppDialogLayer } from '../dialog/AppDialogLayer'
import { AppToastHost, type useToastStore } from '../toast/AppToastHost'
import type { RefCallback } from 'react'

export function ShellOverlayLayer({
  dialogs,
  contextMenu,
  onCloseContextMenu,
  overlayHostRef,
  toastStore,
  hasModalDialog,
}: {
  dialogs: AppDialogRegistration[]
  contextMenu: AppContextMenuState | null
  onCloseContextMenu: () => void
  overlayHostRef: RefCallback<HTMLDivElement>
  toastStore: ReturnType<typeof useToastStore>
  hasModalDialog: boolean
}) {
  return (
    <>
      <div className="app-shell__overlay-host" ref={overlayHostRef} />
      <AppDialogLayer dialogs={dialogs} />
      <AppToastHost
        toasts={toastStore.toasts}
        interactive={!hasModalDialog}
        onDismiss={toastStore.toast.dismiss}
        onExited={toastStore.removeToast}
        onPause={(id) => toastStore.pauseTimer(id, 'hover')}
        onResume={(id) => toastStore.resumeTimer(id, 'hover')}
      />
      <AppContextMenuLayer
        menu={contextMenu}
        onClose={onCloseContextMenu}
      />
    </>
  )
}
