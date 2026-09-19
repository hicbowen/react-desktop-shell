import type { ReactNode } from 'react'
import { AppContextMenuContext } from '../context-menu/AppContextMenuContext'
import { AppDialogContext } from '../dialog/AppDialogContext'
import { AppMessageBoxContext } from '../dialog/AppMessageBoxContext'
import { AppLocaleContext } from '../localization/AppLocaleContext'
import { AppOverlayHostContext } from '../overlay/AppOverlayHostContext'
import { AppToastContext } from '../toast/AppToastContext'
import { AppPlatformContext } from './AppPlatformContext'
import type { AppServices } from './useAppServices'

export function AppServiceContexts({
  children,
  services,
}: {
  children: ReactNode
  services: AppServices
}) {
  return (
    <AppLocaleContext.Provider value={services.localeContextValue}>
      <AppPlatformContext.Provider value={services.platformValue}>
        <AppToastContext.Provider value={services.toastStore.toast}>
          <AppMessageBoxContext.Provider
            value={services.dialogController.messageBox}
          >
            <AppDialogContext.Provider
              value={services.dialogController.registry}
            >
              <AppContextMenuContext.Provider
                value={services.contextMenuController.contextValue}
              >
                <AppOverlayHostContext.Provider value={services.overlayHost}>
                  {children}
                </AppOverlayHostContext.Provider>
              </AppContextMenuContext.Provider>
            </AppDialogContext.Provider>
          </AppMessageBoxContext.Provider>
        </AppToastContext.Provider>
      </AppPlatformContext.Provider>
    </AppLocaleContext.Provider>
  )
}
