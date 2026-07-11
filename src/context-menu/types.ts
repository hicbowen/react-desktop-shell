import type { ReactElement, ReactNode } from 'react'

export type AppContextMenuMode = 'native' | 'app'

export interface AppClipboardAdapter {
  readText(): Promise<string>
  writeText(text: string): Promise<void>
}

export interface AppContextMenuLocale {
  undo: string
  cut: string
  copy: string
  paste: string
  delete: string
  selectAll: string
}

export interface AppContextMenuActionItem {
  key: string
  label: ReactNode
  icon?: ReactNode
  shortcut?: ReactNode
  disabled?: boolean
  danger?: boolean
  onClick?: () => void
}

export interface AppContextMenuSubmenuItem {
  key: string
  label: ReactNode
  icon?: ReactNode
  disabled?: boolean
  danger?: boolean
  submenu: AppContextMenuItem[]
}

export interface AppContextMenuSeparatorItem {
  type: 'separator'
}

export type AppContextMenuItem =
  | AppContextMenuActionItem
  | AppContextMenuSubmenuItem
  | AppContextMenuSeparatorItem

export interface AppContextMenuProps {
  items: AppContextMenuItem[]
  children: ReactElement
  disabled?: boolean
}
