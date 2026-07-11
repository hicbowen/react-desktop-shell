import { cloneElement, useEffect, useId } from 'react'
import {
  APP_CONTEXT_MENU_ATTRIBUTE,
  useAppContextMenuRegistry,
} from './AppContextMenuContext'
import type { AppContextMenuProps } from './types'

export function AppContextMenu({
  items,
  children,
  disabled = false,
}: AppContextMenuProps) {
  const registry = useAppContextMenuRegistry()
  const reactId = useId()
  const id = `app-context-menu-${reactId.replace(/:/g, '')}`

  useEffect(() => {
    registry?.register({
      id,
      items,
      disabled,
    })

    return () => {
      registry?.unregister(id)
    }
  }, [disabled, id, items, registry])

  return cloneElement(children, {
    [APP_CONTEXT_MENU_ATTRIBUTE]: id,
  } as Record<string, string>)
}
