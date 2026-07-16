import type { ReactElement, ReactNode } from 'react'

export type AppContextMenuMode = 'native' | 'app'

export interface AppClipboardAdapter {
  readText(): Promise<string>
  writeText(text: string): Promise<void>
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

export interface AppContextMenuOpenOptions {
  /** Menu items captured when the menu is opened. */
  items: AppContextMenuItem[]
  /** Viewport-relative coordinates, normally event.clientX/clientY. */
  x: number
  y: number
  /** Element that caused the menu to open. */
  trigger?: HTMLElement | null
}

export interface AppContextMenuApi {
  /** Opens or replaces the current application context menu. */
  open(options: AppContextMenuOpenOptions): void
  /** Closes the current context menu using the normal focus-restoration path. */
  close(): void
}

export interface AppContextMenuProps {
  items: AppContextMenuItem[]
  children: ReactElement
  disabled?: boolean
}
