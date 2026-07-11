import { useMemo, useRef } from 'react'
import type { CSSProperties } from 'react'
import { AppContextMenuContext } from '../context-menu/AppContextMenuContext'
import { useContextMenuController } from '../context-menu/useContextMenuController'
import { AppDialogContext } from '../dialog/AppDialogContext'
import { AppMessageBoxContext } from '../dialog/AppMessageBoxContext'
import { useDialogController } from '../dialog/useDialogController'
import { AppToastContext } from '../toast/AppToastContext'
import {
  defaultToastLocale,
  useToastStore,
} from '../toast/AppToastHost'
import {
  defaultClipboardAdapter,
} from '../context-menu/AppContextMenuTextActions'
import type { AppShellProps } from './types'
import './AppShell.css'
import {
  ShellInlinePane,
  ShellPaneLayer,
  ShellPaneToggleButton,
  ShellSidebarHeader,
} from './ShellPaneLayer'
import { ShellOverlayLayer } from './ShellOverlayLayer'
import { usePaneController } from './usePaneController'

export function AppShell({
  theme = 'system',
  contextMenu = 'native',
  clipboard = defaultClipboardAdapter,
  contextMenuLocale,
  messageBoxLocale,
  toastLocale,
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
  const pane = usePaneController({ sidebar, containerRef: rootRef })
  const sidebarCollapsible = pane.collapsible
  const sidebarCollapsed = pane.collapsed
  const isMinimal = pane.isMinimal
  const isPaneOpen = pane.isOpen
  const suppressPaneTransition = pane.suppressTransition
  const sidebarExpandedWidth = pane.expandedWidth
  const sidebarCompactWidth = pane.compactWidth
  const resolvedDisplayMode = pane.resolvedDisplayMode
  const toggleSidebar = pane.toggle
  const contextMenuController = useContextMenuController({
    rootRef,
    mode: contextMenu,
    clipboard,
    locale: contextMenuLocale,
  })
  const dialogController = useDialogController(
    messageBoxLocale,
    contextMenuController.dismissMenu,
  )
  const resolvedToastLocale = useMemo(
    () => ({ ...defaultToastLocale, ...toastLocale }),
    [toastLocale],
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

  const contentClassNames = useMemo(() => {
    const classes = ['app-shell__content']

    if (contentClassName) {
      classes.push(contentClassName)
    }

    return classes.join(' ')
  }, [contentClassName])

  const shellStyle = useMemo(
    () =>
      ({
        '--app-sidebar-expanded-width': `${sidebarExpandedWidth}px`,
        '--app-sidebar-compact-width': `${sidebarCompactWidth}px`,
        '--app-sidebar-width': sidebarCollapsed
          ? `${sidebarCompactWidth}px`
          : isMinimal
            ? '0px'
            : `${sidebarExpandedWidth}px`,
        ...style,
      }) as CSSProperties,
    [
      isMinimal,
      sidebarCollapsed,
      sidebarCompactWidth,
      sidebarExpandedWidth,
      style,
    ],
  )

  const paneToggleAriaLabel = isMinimal
    ? isPaneOpen
      ? 'Close navigation'
      : 'Open navigation'
    : sidebarCollapsed
      ? 'Expand navigation'
      : 'Collapse navigation'

  return (
    <AppToastContext.Provider value={toastStore.toast}>
      <AppMessageBoxContext.Provider value={dialogController.messageBox}>
        <AppDialogContext.Provider value={dialogController.registry}>
          <AppContextMenuContext.Provider value={contextMenuController.registry}>
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
              {hasSidebar && !isMinimal && !sidebarCollapsed && (
                sidebarHeader ?? (
                  <ShellSidebarHeader
                    appTitle={title}
                    ariaLabel={paneToggleAriaLabel}
                    compact={sidebarCollapsed}
                    icon={icon}
                    onToggle={toggleSidebar}
                    showToggle={sidebarCollapsible}
                  />
                )
              )}
              <div className="app-shell__titlebar">
                {hasSidebar &&
                  sidebarCollapsible &&
                  (sidebarCollapsed || (isMinimal && !isPaneOpen)) && (
                    <div className="app-shell__titlebar-leading">
                      <ShellPaneToggleButton
                        ariaLabel={paneToggleAriaLabel}
                        expanded={isMinimal ? isPaneOpen : false}
                        onToggle={toggleSidebar}
                      />
                    </div>
                  )}
                <div className="app-shell__titlebar-main">{titleBar}</div>
              </div>
              {hasSidebar && !isMinimal && (
                <ShellInlinePane
                  pane={pane}
                  rail={rail}
                  onCollapsedChange={sidebar?.onCollapsedChange}
                />
              )}
              <div className="app-shell__body">
                <div className={contentClassNames} style={contentStyle}>
                  {children}
                </div>
              </div>
              {hasSidebar && (
                <ShellPaneLayer
                  pane={pane}
                  rail={rail}
                  sidebarHeader={sidebarHeader}
                  title={title}
                  icon={icon}
                  ariaLabel={paneToggleAriaLabel}
                />
              )}
              <ShellOverlayLayer
                dialogs={dialogController.dialogs}
                contextMenu={contextMenuController.menu}
                onCloseContextMenu={contextMenuController.closeMenu}
                toastStore={toastStore}
                toastLocale={resolvedToastLocale}
                hasModalDialog={dialogController.hasModalDialog}
              />
            </div>
          </AppContextMenuContext.Provider>
        </AppDialogContext.Provider>
      </AppMessageBoxContext.Provider>
    </AppToastContext.Provider>
  )
}
