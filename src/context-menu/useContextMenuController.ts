import { useCallback, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent, RefObject } from 'react'
import type {
  AppClipboardAdapter,
  AppContextMenuItem,
  AppContextMenuLocale,
  AppContextMenuMode,
} from './types'
import {
  APP_CONTEXT_MENU_ATTRIBUTE,
  type AppContextMenuRegistration,
  type AppContextMenuRegistry,
} from './AppContextMenuContext'
import type { AppContextMenuState } from './AppContextMenuLayer'
import {
  createEditableMenuItems,
  createSelectionMenuItems,
  defaultContextMenuLocale,
  getEditableElement,
  hasEditableSelection,
} from './AppContextMenuTextActions'

export function useContextMenuController({
  rootRef,
  mode,
  clipboard,
  locale,
}: {
  rootRef: RefObject<HTMLDivElement | null>
  mode: AppContextMenuMode
  clipboard: AppClipboardAdapter
  locale: Partial<AppContextMenuLocale> | undefined
}) {
  const registryRef = useRef(new Map<string, AppContextMenuRegistration>())
  const restoreFocusRef = useRef<HTMLElement | null>(null)
  const [menu, setMenu] = useState<AppContextMenuState | null>(null)
  const resolvedLocale = useMemo(
    () => ({ ...defaultContextMenuLocale, ...locale }),
    [locale],
  )
  const registry = useMemo<AppContextMenuRegistry>(
    () => ({
      register(registration) {
        registryRef.current.set(registration.id, registration)
      },
      unregister(id) {
        registryRef.current.delete(id)
      },
      get(id) {
        return registryRef.current.get(id)
      },
    }),
    [],
  )
  const dismissMenu = useCallback(() => setMenu(null), [])
  const closeMenu = useCallback(() => {
    setMenu(null)
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
          return { trigger, items: registration.items }
        }

        trigger =
          trigger.parentElement?.closest<HTMLElement>(
            `[${APP_CONTEXT_MENU_ATTRIBUTE}]`,
          ) ?? null
      }

      return null
    },
    [registry, rootRef],
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
          items: createEditableMenuItems(editable, clipboard, resolvedLocale),
          preserveTriggerFocus: true,
        }
      }

      const selectionText = window.getSelection()?.toString() ?? ''

      if (selectionText.trim().length > 0) {
        return {
          trigger: target instanceof HTMLElement ? target : null,
          items: createSelectionMenuItems(clipboard, resolvedLocale),
        }
      }

      return null
    },
    [clipboard, findCustomMenu, resolvedLocale],
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
      setMenu({
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
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (mode === 'native') {
        return
      }

      event.preventDefault()
      const resolved = resolveMenu(event.target)

      if (!resolved) {
        dismissMenu()
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
    [dismissMenu, mode, openMenu, resolveMenu],
  )
  const handleMouseDown = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (mode === 'native' || event.button !== 2) {
        return
      }

      const editable = getEditableElement(event.target)

      if (editable && hasEditableSelection(editable)) {
        event.preventDefault()
      }
    },
    [mode],
  )
  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (
        mode === 'native' ||
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
        dismissMenu()
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
    [dismissMenu, mode, openMenu, resolveMenu, rootRef],
  )

  return {
    registry,
    menu,
    closeMenu,
    dismissMenu,
    handleContextMenu,
    handleMouseDown,
    handleKeyDown,
  }
}
