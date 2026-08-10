import {
  cloneElement,
  isValidElement,
  useCallback,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { AppTitleBar } from '../AppTitleBar'
import { appTitleBarTypeMarker } from '../AppTitleBarMarker'
import { AppContextMenuContext } from '../context-menu/AppContextMenuContext'
import { useContextMenuController } from '../context-menu/useContextMenuController'
import { AppDialogContext } from '../dialog/AppDialogContext'
import { AppMessageBoxContext } from '../dialog/AppMessageBoxContext'
import { useDialogController } from '../dialog/useDialogController'
import { AppToastContext } from '../toast/AppToastContext'
import { AppOverlayHostContext } from '../overlay/AppOverlayHostContext'
import { AppLocaleContext } from '../localization/AppLocaleContext'
import { appLocaleSettings } from '../localization/localeSettings'
import { appLocaleMessages } from '../localization/messages'
import { useResolvedAppLocale } from '../localization/resolveAppLocale'
import { useToastStore } from '../toast/AppToastHost'
import { AppScrollArea } from '../scroll-area/AppScrollArea'
import {
  defaultClipboardAdapter,
} from '../context-menu/AppContextMenuTextActions'
import type { AppShellProps } from './types'
import './AppShell.css'
import {
  ShellInlinePane,
  ShellPaneLayer,
  ShellTitleBarApp,
} from './ShellPaneLayer'
import { ShellOverlayLayer } from './ShellOverlayLayer'
import { SidebarLayoutContext } from './SidebarLayoutContext'
import { usePaneController } from './usePaneController'

function isAppTitleBarType(type: unknown) {
  if (type === AppTitleBar) return true

  if (typeof type !== 'function' && (typeof type !== 'object' || type === null)) {
    return false
  }

  if (Reflect.get(type, appTitleBarTypeMarker) === true) return true

  // React Fast Refresh can temporarily retain the previous component function.
  return typeof type === 'function' && type.name === AppTitleBar.name
}

export function AppShell({
  locale = 'system',
  theme = 'system',
  contextMenu = 'native',
  clipboard = defaultClipboardAdapter,
  toastOptions,
  title,
  icon,
  sidebar,
  sidebarHeader,
  titleBar,
  rail,
  children,
  className,
  style,
  contentClassName,
  contentStyle,
}: AppShellProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const resolvedLocale = useResolvedAppLocale(locale)
  const localeContextValue = useMemo(() => {
    const settings = appLocaleSettings[resolvedLocale]
    return {
      locale: settings.intlLocale,
      messages: appLocaleMessages[resolvedLocale],
      firstDayOfWeek: settings.firstDayOfWeek,
      hourCycle: settings.hourCycle,
    }
  }, [resolvedLocale])
  const [overlayHost, setOverlayHost] = useState<HTMLDivElement | null>(null)
  const [sidebarNavigationOverflow, setSidebarNavigationOverflow] =
    useState<boolean | null>(null)
  const registerNavigationOverflow = useCallback(() => {
    setSidebarNavigationOverflow(false)

    return () => setSidebarNavigationOverflow(null)
  }, [])
  const reportNavigationOverflow = useCallback((overflow: boolean) => {
    setSidebarNavigationOverflow(overflow)
  }, [])
  const sidebarLayoutContextValue = useMemo(
    () => ({
      registerNavigationOverflow,
      reportNavigationOverflow,
    }),
    [registerNavigationOverflow, reportNavigationOverflow],
  )
  const pane = usePaneController({ sidebar, containerRef: rootRef })
  const sidebarCollapsible = pane.collapsible
  const sidebarCollapsed = pane.collapsed
  const isMinimal = pane.isMinimal
  const isPaneOpen = pane.isOpen
  const isPaneClosing = pane.isClosing
  const suppressPaneTransition = pane.suppressTransition
  const sidebarExpandedWidth = pane.expandedWidth
  const sidebarCompactWidth = pane.compactWidth
  const resolvedDisplayMode = pane.resolvedDisplayMode
  const toggleSidebar = pane.toggle
  const paneToggleRef = useRef<HTMLButtonElement | null>(null)
  const paneInteractionModeRef = useRef<'keyboard' | 'pointer'>('keyboard')
  const contextMenuController = useContextMenuController({
    rootRef,
    mode: contextMenu,
    clipboard,
    messages: localeContextValue.messages.contextMenu,
  })
  const dialogController = useDialogController(
    localeContextValue.messages.common,
    contextMenuController.dismissMenu,
  )
  const toastStore = useToastStore(toastOptions)
  const hasSidebar = rail !== undefined || sidebarHeader !== undefined

  const rootClassName = useMemo(() => {
    const classes = ['app-shell']

    if (!hasSidebar) {
      classes.push('app-shell--no-sidebar')
    }

    if (isMinimal) {
      classes.push('app-shell--pane-minimal')
    } else if (sidebarCollapsed) {
      classes.push('app-shell--sidebar-collapsed')
    }

    if (suppressPaneTransition) {
      classes.push('app-shell--pane-transition-suppressed')
    }

    if (className) {
      classes.push(className)
    }

    return classes.join(' ')
  }, [
    className,
    hasSidebar,
    isMinimal,
    sidebarCollapsed,
    suppressPaneTransition,
  ])

  const shellStyle = useMemo(
    () => {
      const compactEffectiveWidth =
        sidebarNavigationOverflow === false
          ? 'calc(var(--app-sidebar-compact-width) - var(--app-sidebar-scrollbar-gutter-size))'
          : 'var(--app-sidebar-compact-width)'

      return {
        '--app-sidebar-expanded-width': `${sidebarExpandedWidth}px`,
        '--app-sidebar-compact-width': `${sidebarCompactWidth}px`,
        '--app-sidebar-compact-effective-width': compactEffectiveWidth,
        '--app-sidebar-width': sidebarCollapsed
          ? 'var(--app-sidebar-compact-effective-width)'
          : isMinimal
            ? '0px'
            : `${sidebarExpandedWidth}px`,
        ...style,
      } as CSSProperties
    },
    [
      isMinimal,
      sidebarCollapsed,
      sidebarCompactWidth,
      sidebarExpandedWidth,
      sidebarNavigationOverflow,
      style,
    ],
  )

  const paneToggleAriaLabel = isMinimal
    ? isPaneOpen
      ? localeContextValue.messages.shell.closeNavigation
      : localeContextValue.messages.shell.openNavigation
    : sidebarCollapsed
      ? localeContextValue.messages.shell.expandNavigation
      : localeContextValue.messages.shell.collapseNavigation

  const titleBarLeading = hasSidebar
    ? sidebarHeader ?? (
        <ShellTitleBarApp
          appTitle={title}
          ariaLabel={paneToggleAriaLabel}
          expanded={isMinimal ? isPaneOpen : !sidebarCollapsed}
          icon={icon}
          onToggle={toggleSidebar}
          showToggle={sidebarCollapsible}
          interactionModeRef={paneInteractionModeRef}
          toggleButtonRef={paneToggleRef}
        />
      )
    : undefined
  const appTitleBar =
    isValidElement<{ leading?: ReactNode }>(titleBar) &&
    isAppTitleBarType(titleBar.type)
      ? titleBar
      : null
  const renderedTitleBar =
    appTitleBar && titleBarLeading !== undefined
      ? cloneElement(appTitleBar, { leading: titleBarLeading })
      : titleBar

  return (
    <AppLocaleContext.Provider value={localeContextValue}>
      <AppToastContext.Provider value={toastStore.toast}>
        <AppMessageBoxContext.Provider value={dialogController.messageBox}>
          <AppDialogContext.Provider value={dialogController.registry}>
            <AppContextMenuContext.Provider value={contextMenuController.contextValue}>
              <AppOverlayHostContext.Provider value={overlayHost}>
                <div
                  ref={rootRef}
                  className={rootClassName}
                  data-pane-mode={resolvedDisplayMode}
                  data-theme={theme}
                  style={shellStyle}
                  onMouseDownCapture={contextMenuController.handleMouseDown}
                  onContextMenuCapture={contextMenuController.handleContextMenu}
                  onKeyDownCapture={contextMenuController.handleKeyDown}
                >
              <div className="app-shell__titlebar">
                {hasSidebar && !appTitleBar && (
                  <div className="app-shell__titlebar-leading">
                    {titleBarLeading}
                  </div>
                )}
                <div className="app-shell__titlebar-main">
                  {renderedTitleBar}
                </div>
              </div>
              {hasSidebar && !isMinimal && (
                <SidebarLayoutContext.Provider value={sidebarLayoutContextValue}>
                  <ShellInlinePane
                    pane={pane}
                    rail={rail}
                    onCollapsedChange={sidebar?.onCollapsedChange}
                  />
                </SidebarLayoutContext.Provider>
              )}
              <div
                className="app-shell__body"
                inert={isMinimal && (isPaneOpen || isPaneClosing) ? true : undefined}
              >
                <AppScrollArea
                  className="app-shell__content"
                  orientation="both"
                  viewportClassName={contentClassName}
                  viewportStyle={contentStyle}
                >
                  {children}
                </AppScrollArea>
              </div>
              {hasSidebar && (
                <SidebarLayoutContext.Provider value={sidebarLayoutContextValue}>
                  <ShellPaneLayer
                    pane={pane}
                    rail={rail}
                    interactionModeRef={paneInteractionModeRef}
                    toggleButtonRef={paneToggleRef}
                  />
                </SidebarLayoutContext.Provider>
              )}
              <ShellOverlayLayer
                  dialogs={dialogController.dialogs}
                  contextMenu={contextMenuController.menu}
                  onCloseContextMenu={contextMenuController.closeMenu}
                  overlayHostRef={setOverlayHost}
                  toastStore={toastStore}
                  hasModalDialog={dialogController.hasModalDialog}
              />
                </div>
              </AppOverlayHostContext.Provider>
            </AppContextMenuContext.Provider>
          </AppDialogContext.Provider>
        </AppMessageBoxContext.Provider>
      </AppToastContext.Provider>
    </AppLocaleContext.Provider>
  )
}
