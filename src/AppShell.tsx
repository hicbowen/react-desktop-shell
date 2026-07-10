import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { CSSProperties, ReactElement, ReactNode } from 'react'
import {
  APP_CONTEXT_MENU_ATTRIBUTE,
  AppContextMenuContext,
  type AppContextMenuRegistration,
} from './AppContextMenuContext'
import { AppContextMenuLayer, type AppContextMenuState } from './AppContextMenuLayer'
import {
  AppDialogContext,
  type AppDialogRegistration,
} from './AppDialogContext'
import { AppDialogLayer } from './AppDialogLayer'
import { AppMessageBoxContext } from './AppMessageBoxContext'
import { AppToastContext } from './AppToastContext'
import {
  AppToastHost,
  defaultToastLocale,
  useToastStore,
} from './AppToastHost'
import {
  defaultMessageBoxLocale,
  renderMessageBoxActions,
  renderMessageBoxContent,
  useMessageBoxQueue,
} from './AppMessageBoxHost'
import {
  createEditableMenuItems,
  createSelectionMenuItems,
  defaultClipboardAdapter,
  defaultContextMenuLocale,
  getEditableElement,
  hasEditableSelection,
} from './AppContextMenuTextActions'
import type {
  AppContextMenuItem,
  AppRailProps,
  AppShellProps,
  PaneDisplayMode,
} from './types'
import './AppShell.css'
import type { AppMessageBoxOptions } from './types'

const DEFAULT_SIDEBAR_EXPANDED_WIDTH = 316
const DEFAULT_SIDEBAR_COMPACT_WIDTH = 56
const DEFAULT_EXPANDED_BREAKPOINT = 1008
const DEFAULT_COMPACT_BREAKPOINT = 640

type ResolvedPaneDisplayMode = Exclude<PaneDisplayMode, 'auto'>
type NavigationPresentation = 'inline' | 'compact-flyout'

function resolvePaneDisplayMode(
  width: number,
  expandedBreakpoint: number,
  compactBreakpoint: number,
): ResolvedPaneDisplayMode {
  if (width >= expandedBreakpoint) {
    return 'expanded'
  }

  if (width >= compactBreakpoint) {
    return 'compact'
  }

  return 'minimal'
}

function displayModeFromCollapsed(collapsed: boolean): ResolvedPaneDisplayMode {
  return collapsed ? 'compact' : 'expanded'
}

function MenuIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="18"
      viewBox="0 0 18 18"
      width="18"
    >
      <path
        d="M3 5h12M3 9h12M3 13h12"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </svg>
  )
}

function PaneToggleButton({
  ariaLabel,
  expanded,
  onToggle,
}: {
  ariaLabel: string
  expanded: boolean
  onToggle: () => void
}) {
  return (
    <button
      aria-expanded={expanded}
      aria-label={ariaLabel}
      className="app-shell__pane-toggle"
      onClick={onToggle}
      type="button"
    >
      <MenuIcon />
    </button>
  )
}

function SidebarHeader({
  appTitle,
  ariaLabel,
  compact,
  icon,
  onToggle,
  showToggle,
}: {
  appTitle?: ReactNode
  ariaLabel: string
  compact: boolean
  icon?: ReactNode
  onToggle: () => void
  showToggle: boolean
}) {
  return (
    <div className="app-shell__sidebar-header">
      {showToggle && (
        <PaneToggleButton
          ariaLabel={ariaLabel}
          expanded={!compact}
          onToggle={onToggle}
        />
      )}
      {!compact && icon && (
        <span className="app-shell__sidebar-icon">{icon}</span>
      )}
      {!compact && appTitle && (
        <span className="app-shell__sidebar-title">{appTitle}</span>
      )}
    </div>
  )
}

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
  const registryRef = useRef(new Map<string, AppContextMenuRegistration>())
  const dialogRegistryRef = useRef(new Map<string, AppDialogRegistration>())
  const restoreFocusRef = useRef<HTMLElement | null>(null)
  const displayModeControlled = sidebar?.displayMode !== undefined
  const collapsedControlled =
    !displayModeControlled && sidebar?.collapsed !== undefined
  const defaultDisplayMode =
    sidebar === undefined
      ? 'expanded'
      : (sidebar.defaultDisplayMode ??
        (sidebar.defaultCollapsed !== undefined
          ? displayModeFromCollapsed(sidebar.defaultCollapsed)
          : 'auto'))
  const [uncontrolledDisplayMode, setUncontrolledDisplayMode] =
    useState<PaneDisplayMode>(defaultDisplayMode)
  const [autoResolvedDisplayMode, setAutoResolvedDisplayMode] =
    useState<ResolvedPaneDisplayMode>('expanded')
  const previousAutoResolvedMode = useRef(autoResolvedDisplayMode)
  const paneTransitionTimeout = useRef<number | undefined>(undefined)
  const [suppressPaneTransition, setSuppressPaneTransition] = useState(false)
  const [autoPaneOverride, setAutoPaneOverride] =
    useState<Exclude<ResolvedPaneDisplayMode, 'minimal'> | null>(null)
  const paneOpenControlled = sidebar?.isPaneOpen !== undefined
  const [uncontrolledPaneOpen, setUncontrolledPaneOpen] = useState(
    sidebar?.defaultPaneOpen ?? false,
  )
  const [activeMenu, setActiveMenu] = useState<AppContextMenuState | null>(null)
  const [dialogs, setDialogs] = useState<AppDialogRegistration[]>([])
  const [messageBoxRequest, setMessageBoxRequest] =
    useState<{
      id: number
      options: AppMessageBoxOptions
      restoreFocusElement: HTMLElement | null
    } | null>(null)
  const locale = useMemo(
    () => ({ ...defaultContextMenuLocale, ...contextMenuLocale }),
    [contextMenuLocale],
  )
  const resolvedMessageBoxLocale = useMemo(
    () => ({ ...defaultMessageBoxLocale, ...messageBoxLocale }),
    [messageBoxLocale],
  )
  const resolvedToastLocale = useMemo(
    () => ({ ...defaultToastLocale, ...toastLocale }),
    [toastLocale],
  )
  const {
    toast,
    toasts,
    pauseTimer,
    resumeTimer,
    removeToast,
  } = useToastStore(toastOptions)
  const sidebarCollapsible = sidebar?.collapsible ?? sidebar !== undefined
  const displayMode = displayModeControlled
    ? sidebar.displayMode
    : collapsedControlled
      ? displayModeFromCollapsed(Boolean(sidebar?.collapsed))
      : uncontrolledDisplayMode
  const baseResolvedDisplayMode =
    displayMode === 'auto' ? autoResolvedDisplayMode : displayMode
  const resolvedDisplayMode =
    displayMode === 'auto' &&
    baseResolvedDisplayMode !== 'minimal' &&
    autoPaneOverride
      ? autoPaneOverride
      : baseResolvedDisplayMode
  const navigationPresentation: NavigationPresentation =
    resolvedDisplayMode === 'compact' ? 'compact-flyout' : 'inline'
  const sidebarCollapsed = navigationPresentation === 'compact-flyout'
  const isMinimal = resolvedDisplayMode === 'minimal'
  const isPaneOpen = paneOpenControlled
    ? Boolean(sidebar?.isPaneOpen)
    : uncontrolledPaneOpen
  const sidebarExpandedWidth =
    sidebar?.expandedWidth ?? DEFAULT_SIDEBAR_EXPANDED_WIDTH
  const sidebarCompactWidth =
    sidebar?.compactWidth ?? DEFAULT_SIDEBAR_COMPACT_WIDTH
  const expandedBreakpoint =
    sidebar?.expandedBreakpoint ?? DEFAULT_EXPANDED_BREAKPOINT
  const compactBreakpoint =
    sidebar?.compactBreakpoint ?? DEFAULT_COMPACT_BREAKPOINT
  const hasSidebar = rail !== undefined || sidebarHeader !== undefined

  const setPaneOpen = useCallback(
    (open: boolean) => {
      if (!sidebarCollapsible) {
        return
      }

      if (!paneOpenControlled) {
        setUncontrolledPaneOpen(open)
      }

      sidebar?.onPaneOpenChange?.(open)
    },
    [paneOpenControlled, sidebar, sidebarCollapsible],
  )

  const setDisplayMode = useCallback(
    (nextDisplayMode: PaneDisplayMode) => {
      if (!sidebarCollapsible) {
        return
      }

      if (displayMode === 'auto') {
        if (nextDisplayMode === 'expanded' || nextDisplayMode === 'compact') {
          setAutoPaneOverride(nextDisplayMode)
        }
        return
      }

      if (!displayModeControlled && !collapsedControlled) {
        setUncontrolledDisplayMode(nextDisplayMode)
      }

      sidebar?.onDisplayModeChange?.(nextDisplayMode)

      if (collapsedControlled || sidebar?.onCollapsedChange) {
        sidebar?.onCollapsedChange?.(nextDisplayMode === 'compact')
      }
    },
    [
      collapsedControlled,
      displayMode,
      displayModeControlled,
      sidebar,
      sidebarCollapsible,
    ],
  )

  const toggleSidebar = useCallback(() => {
    if (isMinimal) {
      setPaneOpen(!isPaneOpen)
      return
    }

    setDisplayMode(
      resolvedDisplayMode === 'expanded' ? 'compact' : 'expanded',
    )
  }, [
    isMinimal,
    isPaneOpen,
    resolvedDisplayMode,
    setDisplayMode,
    setPaneOpen,
  ])

  const closePane = useCallback(() => {
    setPaneOpen(false)
  }, [setPaneOpen])

  useEffect(() => {
    const root = rootRef.current

    if (
      !root ||
      typeof ResizeObserver === 'undefined' ||
      displayMode !== 'auto'
    ) {
      return
    }

    const updateAutoMode = (width: number) => {
      const nextMode = resolvePaneDisplayMode(
        width,
        expandedBreakpoint,
        compactBreakpoint,
      )

      const previousMode = previousAutoResolvedMode.current

      if (previousMode === nextMode) {
        return
      }

      if (previousMode === 'minimal' || nextMode === 'minimal') {
        window.clearTimeout(paneTransitionTimeout.current)
        setSuppressPaneTransition(true)
        paneTransitionTimeout.current = window.setTimeout(() => {
          setSuppressPaneTransition(false)
        }, 180)
      }

      previousAutoResolvedMode.current = nextMode
      setAutoResolvedDisplayMode(nextMode)
      setAutoPaneOverride(null)

      if (nextMode === 'minimal') {
        setPaneOpen(false)
      }
    }

    updateAutoMode(root.getBoundingClientRect().width)

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]

      if (entry) {
        updateAutoMode(entry.contentRect.width)
      }
    })

    observer.observe(root)
    return () => {
      observer.disconnect()
      window.clearTimeout(paneTransitionTimeout.current)
    }
  }, [compactBreakpoint, displayMode, expandedBreakpoint, setPaneOpen])

  useEffect(() => {
    if (isMinimal || !isPaneOpen) {
      return
    }

    const timeout = window.setTimeout(closePane, 0)
    return () => window.clearTimeout(timeout)
  }, [closePane, isMinimal, isPaneOpen])

  useEffect(() => {
    if (!isMinimal || !isPaneOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return
      }

      event.preventDefault()
      closePane()
    }

    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [closePane, isMinimal, isPaneOpen])

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

  const renderedRail = useMemo(() => {
    if (!rail) {
      return null
    }

    if (!sidebarCollapsible || !isValidElement(rail)) {
      return rail
    }

    const railElement = rail as ReactElement<Partial<AppRailProps>>

    return cloneElement(railElement, {
      collapsed: sidebarCollapsed,
      onCollapsedChange: sidebar?.onCollapsedChange,
    })
  }, [rail, sidebar?.onCollapsedChange, sidebarCollapsed, sidebarCollapsible])

  const renderedOverlayRail = useMemo(() => {
    if (!rail) {
      return null
    }

    if (!isValidElement(rail)) {
      return rail
    }

    const railElement = rail as ReactElement<Partial<AppRailProps>>
    const originalOnChange = railElement.props.onChange

    return cloneElement(railElement, {
      collapsed: false,
      onChange: (key: string) => {
        originalOnChange?.(key)
        closePane()
      },
      onCollapsedChange: undefined,
    })
  }, [closePane, rail])

  const registry = useMemo(
    () => ({
      register(registration: AppContextMenuRegistration) {
        registryRef.current.set(registration.id, registration)
      },
      unregister(id: string) {
        registryRef.current.delete(id)
      },
      get(id: string) {
        return registryRef.current.get(id)
      },
    }),
    [],
  )

  const syncDialogs = useCallback(() => {
    setDialogs(Array.from(dialogRegistryRef.current.values()))
  }, [])

  const dialogRegistry = useMemo(
    () => ({
      register(dialog: AppDialogRegistration) {
        dialogRegistryRef.current.set(dialog.id, dialog)
        setActiveMenu(null)
        syncDialogs()
      },
      unregister(id: string) {
        dialogRegistryRef.current.delete(id)
        syncDialogs()
      },
    }),
    [syncDialogs],
  )

  const { messageBox, completeCurrent } = useMessageBoxQueue(
    resolvedMessageBoxLocale,
    useCallback((request) => {
      if (request) {
        setActiveMenu(null)
      }

      setMessageBoxRequest(
        request
          ? {
              id: request.id,
              options: request.options,
              restoreFocusElement: request.restoreFocusElement,
            }
          : null,
      )
    }, []),
  )

  const closeMenu = useCallback(() => {
    setActiveMenu(null)
    restoreFocusRef.current?.focus?.({ preventScroll: true })
    restoreFocusRef.current = null
  }, [])

  const findCustomMenu = useCallback(
    (target: EventTarget | null) => {
      if (!(target instanceof Element)) {
        return null
      }

      let trigger = target.closest<HTMLElement>(
        `[${APP_CONTEXT_MENU_ATTRIBUTE}]`,
      )

      while (trigger && rootRef.current?.contains(trigger)) {
        const id = trigger.getAttribute(APP_CONTEXT_MENU_ATTRIBUTE)
        const registration = id ? registry.get(id) : undefined

        if (registration && !registration.disabled) {
          return {
            trigger,
            items: registration.items,
          }
        }

        trigger =
          trigger.parentElement?.closest<HTMLElement>(
            `[${APP_CONTEXT_MENU_ATTRIBUTE}]`,
          ) ?? null
      }

      return null
    },
    [registry],
  )

  const resolveMenu = useCallback(
    (target: EventTarget | null) => {
      const custom = findCustomMenu(target)

      if (custom) {
        return custom
      }

      const editable = getEditableElement(target)

      if (editable) {
        return {
          trigger: editable,
          items: createEditableMenuItems(editable, clipboard, locale),
          preserveTriggerFocus: true,
        }
      }

      const selectionText = window.getSelection()?.toString() ?? ''

      if (selectionText.trim().length > 0) {
        return {
          trigger: target instanceof HTMLElement ? target : null,
          items: createSelectionMenuItems(clipboard, locale),
        }
      }

      return null
    },
    [clipboard, findCustomMenu, locale],
  )

  const openMenu = useCallback(
    (
      items: AppContextMenuItem[],
      x: number,
      y: number,
      trigger: HTMLElement | null,
      keyboard: boolean,
      preserveTriggerFocus = false,
    ) => {
      restoreFocusRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : trigger
      setActiveMenu({
        items,
        x,
        y,
        trigger,
        keyboard,
        preserveTriggerFocus: preserveTriggerFocus && !keyboard,
      })
    },
    [],
  )

  const handleContextMenu = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (contextMenu === 'native') {
        return
      }

      event.preventDefault()
      const resolved = resolveMenu(event.target)

      if (!resolved) {
        setActiveMenu(null)
        return
      }

      openMenu(
        resolved.items,
        event.clientX,
        event.clientY,
        resolved.trigger,
        false,
        resolved.preserveTriggerFocus,
      )
    },
    [contextMenu, openMenu, resolveMenu],
  )

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (contextMenu === 'native' || event.button !== 2) {
        return
      }

      const editable = getEditableElement(event.target)

      if (editable && hasEditableSelection(editable)) {
        event.preventDefault()
      }
    },
    [contextMenu],
  )

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (
        contextMenu === 'native' ||
        (event.key !== 'ContextMenu' &&
          !(event.shiftKey && event.key === 'F10'))
      ) {
        return
      }

      event.preventDefault()
      const activeElement =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null

      if (activeElement && !rootRef.current?.contains(activeElement)) {
        return
      }

      const resolved = resolveMenu(activeElement)

      if (!resolved) {
        setActiveMenu(null)
        return
      }

      const rect = (resolved.trigger ?? activeElement)?.getBoundingClientRect()
      openMenu(
        resolved.items,
        rect ? rect.left : window.innerWidth / 2,
        rect ? rect.bottom : window.innerHeight / 2,
        resolved.trigger,
        true,
      )
    },
    [contextMenu, openMenu, resolveMenu],
  )

  const hasModalDialog = dialogs.length > 0 || messageBoxRequest !== null
  const paneToggleAriaLabel = isMinimal
    ? isPaneOpen
      ? 'Close navigation'
      : 'Open navigation'
    : sidebarCollapsed
      ? 'Expand navigation'
      : 'Collapse navigation'

  return (
    <AppToastContext.Provider value={toast}>
      <AppMessageBoxContext.Provider value={messageBox}>
        <AppDialogContext.Provider value={dialogRegistry}>
          <AppContextMenuContext.Provider value={registry}>
            <div
              ref={rootRef}
              className={rootClassName}
              data-pane-mode={resolvedDisplayMode}
              data-theme={theme}
              style={shellStyle}
              onMouseDownCapture={handleMouseDown}
              onContextMenuCapture={handleContextMenu}
              onKeyDownCapture={handleKeyDown}
            >
              {hasSidebar && !isMinimal && !sidebarCollapsed && (
                sidebarHeader ?? (
                  <SidebarHeader
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
                      <PaneToggleButton
                        ariaLabel={paneToggleAriaLabel}
                        expanded={isMinimal ? isPaneOpen : false}
                        onToggle={toggleSidebar}
                      />
                    </div>
                  )}
                <div className="app-shell__titlebar-main">{titleBar}</div>
              </div>
              {hasSidebar && !isMinimal && (
                <div className="app-shell__sidebar">{renderedRail}</div>
              )}
              <div className="app-shell__body">
                <div className={contentClassNames} style={contentStyle}>
                  {children}
                </div>
              </div>
              {hasSidebar && isMinimal && isPaneOpen && (
                <div className="app-shell__pane-layer">
                  <button
                    aria-label="Close navigation"
                    className="app-shell__pane-backdrop"
                    onClick={closePane}
                    type="button"
                  />
                  <div
                    className="app-shell__pane-overlay"
                    style={{
                      width: sidebarExpandedWidth,
                    }}
                  >
                    {sidebarHeader ?? (
                      <SidebarHeader
                        appTitle={title}
                        ariaLabel={paneToggleAriaLabel}
                        compact={false}
                        icon={icon}
                        onToggle={toggleSidebar}
                        showToggle={sidebarCollapsible}
                      />
                    )}
                    <div className="app-shell__pane-overlay-sidebar">
                      {renderedOverlayRail}
                    </div>
                  </div>
                </div>
              )}
              <AppDialogLayer
                dialogs={[
                  ...dialogs,
                  ...(messageBoxRequest
                    ? [
                        {
                          id: `app-message-box-${messageBoxRequest.id}`,
                          open: true,
                          title: undefined,
                          children: renderMessageBoxContent(
                            messageBoxRequest.options,
                          ),
                          actions: renderMessageBoxActions(
                            messageBoxRequest.options.buttons,
                            completeCurrent,
                          ),
                          width: 420,
                          closeOnEscape:
                            messageBoxRequest.options.closeOnEscape ?? true,
                          closeOnOverlayClick: false,
                          onOpenChange: (open) => {
                            if (!open) {
                              completeCurrent(
                                messageBoxRequest.options.cancelButton,
                              )
                            }
                          },
                          onDefaultAction: () => {
                            const defaultButton =
                              messageBoxRequest.options.defaultButton
                            const button =
                              messageBoxRequest.options.buttons.find(
                                (item) => item.key === defaultButton,
                              )

                            if (button && !button.disabled) {
                              completeCurrent(button.key)
                            }
                          },
                          restoreFocusElement:
                            messageBoxRequest.restoreFocusElement,
                        } satisfies AppDialogRegistration,
                      ]
                    : []),
                ]}
              />
              <AppToastHost
                toasts={toasts}
                locale={resolvedToastLocale}
                interactive={!hasModalDialog}
                onDismiss={toast.dismiss}
                onExited={removeToast}
                onPause={(id) => pauseTimer(id, 'hover')}
                onResume={(id) => resumeTimer(id, 'hover')}
              />
              <AppContextMenuLayer menu={activeMenu} onClose={closeMenu} />
            </div>
          </AppContextMenuContext.Provider>
        </AppDialogContext.Provider>
      </AppMessageBoxContext.Provider>
    </AppToastContext.Provider>
  )
}
