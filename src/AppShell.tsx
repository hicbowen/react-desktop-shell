import { useCallback, useMemo, useRef, useState } from 'react'
import {
  APP_CONTEXT_MENU_ATTRIBUTE,
  AppContextMenuContext,
  type AppContextMenuRegistration,
} from './AppContextMenuContext'
import { AppContextMenuLayer, type AppContextMenuState } from './AppContextMenuLayer'
import {
  createEditableMenuItems,
  createSelectionMenuItems,
  defaultClipboardAdapter,
  defaultContextMenuLocale,
  getEditableElement,
  hasEditableSelection,
} from './AppContextMenuTextActions'
import type { AppContextMenuItem, AppShellProps } from './types'
import './AppShell.css'

export function AppShell({
  theme = 'system',
  contextMenu = 'native',
  clipboard = defaultClipboardAdapter,
  contextMenuLocale,
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
  const restoreFocusRef = useRef<HTMLElement | null>(null)
  const [activeMenu, setActiveMenu] = useState<AppContextMenuState | null>(null)
  const locale = useMemo(
    () => ({ ...defaultContextMenuLocale, ...contextMenuLocale }),
    [contextMenuLocale],
  )

  const rootClassName = useMemo(() => {
    const classes = ['app-shell']

    if (className) {
      classes.push(className)
    }

    return classes.join(' ')
  }, [className])

  const contentClassNames = useMemo(() => {
    const classes = ['app-shell__content']

    if (contentClassName) {
      classes.push(contentClassName)
    }

    return classes.join(' ')
  }, [contentClassName])

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

  return (
    <AppContextMenuContext.Provider value={registry}>
      <div
        ref={rootRef}
        className={rootClassName}
        data-theme={theme}
        style={style}
        onMouseDownCapture={handleMouseDown}
        onContextMenuCapture={handleContextMenu}
        onKeyDownCapture={handleKeyDown}
      >
        {titleBar}
        <div className="app-shell__body">
          {rail}
          <div className={contentClassNames} style={contentStyle}>
            {children}
          </div>
        </div>
        <AppContextMenuLayer menu={activeMenu} onClose={closeMenu} />
      </div>
    </AppContextMenuContext.Provider>
  )
}
