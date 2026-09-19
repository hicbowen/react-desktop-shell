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
import { AppScrollArea } from '../scroll-area/AppScrollArea'
import { getAppThemeStyle } from '../theme/AppTheme'
import { AppServiceContexts } from '../provider/AppServiceContexts'
import { useAppServices } from '../provider/useAppServices'
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
  messages,
  firstDayOfWeek,
  hourCycle,
  theme = 'system',
  themePreset = 'blue',
  themeTokens,
  contextMenu = 'native',
  clipboard,
  platform,
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
  const services = useAppServices({
    clipboard,
    contextMenu,
    firstDayOfWeek,
    hourCycle,
    locale,
    messages,
    platform,
    rootRef,
    toastOptions,
  })
  const localeContextValue = services.localeContextValue
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
        ...getAppThemeStyle(themeTokens),
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
      themeTokens,
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
    <AppServiceContexts services={services}>
                <div
                  ref={rootRef}
                  className={rootClassName}
                  data-pane-mode={resolvedDisplayMode}
                  data-theme={theme}
                  data-theme-preset={themePreset}
                  style={shellStyle}
                  onMouseDownCapture={services.contextMenuController.handleMouseDown}
                  onContextMenuCapture={services.contextMenuController.handleContextMenu}
                  onKeyDownCapture={services.contextMenuController.handleKeyDown}
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
                  dialogs={services.dialogController.dialogs}
                  contextMenu={services.contextMenuController.menu}
                  onCloseContextMenu={services.contextMenuController.closeMenu}
                  overlayHostRef={services.setOverlayHost}
                  toastStore={services.toastStore}
                  hasModalDialog={services.dialogController.hasModalDialog}
              />
                </div>
    </AppServiceContexts>
  )
}
