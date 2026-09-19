import { useMemo, useRef, type CSSProperties } from 'react'
import { ShellOverlayLayer } from '../shell/ShellOverlayLayer'
import { getAppThemeStyle } from '../theme/AppTheme'
import { AppServiceContexts } from './AppServiceContexts'
import { useAppServices } from './useAppServices'
import type { AppProviderProps } from './types'
import './AppProvider.css'

export function AppProvider({
  children,
  className,
  contextMenu = 'native',
  firstDayOfWeek,
  hourCycle,
  locale = 'system',
  messages,
  platform,
  style,
  theme = 'system',
  themePreset = 'blue',
  themeTokens,
  toastOptions,
}: AppProviderProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const services = useAppServices({
    contextMenu,
    firstDayOfWeek,
    hourCycle,
    locale,
    messages,
    platform,
    rootRef,
    toastOptions,
  })
  const providerStyle = useMemo(
    () =>
      ({
        ...getAppThemeStyle(themeTokens),
        ...style,
      }) as CSSProperties,
    [style, themeTokens],
  )

  return (
    <AppServiceContexts services={services}>
      <div
        className={['app-shell', 'app-provider', className]
          .filter(Boolean)
          .join(' ')}
        data-theme={theme}
        data-theme-preset={themePreset}
        onContextMenuCapture={services.contextMenuController.handleContextMenu}
        onKeyDownCapture={services.contextMenuController.handleKeyDown}
        onMouseDownCapture={services.contextMenuController.handleMouseDown}
        ref={rootRef}
        style={providerStyle}
      >
        {children}
        <ShellOverlayLayer
          contextMenu={services.contextMenuController.menu}
          dialogs={services.dialogController.dialogs}
          hasModalDialog={services.dialogController.hasModalDialog}
          onCloseContextMenu={services.contextMenuController.closeMenu}
          overlayHostRef={services.setOverlayHost}
          toastStore={services.toastStore}
        />
      </div>
    </AppServiceContexts>
  )
}
