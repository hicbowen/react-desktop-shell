import { createContext, useContext } from 'react'
import type { AppContextMenuItem } from './types'

export const APP_CONTEXT_MENU_ATTRIBUTE = 'data-app-context-menu-id'

export interface AppContextMenuRegistration {
  id: string
  items: AppContextMenuItem[]
  disabled?: boolean
}

export interface AppContextMenuRegistry {
  register(registration: AppContextMenuRegistration): void
  unregister(id: string): void
  get(id: string): AppContextMenuRegistration | undefined
}

export const AppContextMenuContext =
  createContext<AppContextMenuRegistry | null>(null)

export function useAppContextMenuRegistry() {
  return useContext(AppContextMenuContext)
}

