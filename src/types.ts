import type { CSSProperties, ReactElement, ReactNode } from 'react'

export type AppTheme = 'system' | 'light' | 'dark'
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

export interface AppContextMenuSeparatorItem {
  type: 'separator'
}

export type AppContextMenuItem =
  | AppContextMenuActionItem
  | AppContextMenuSeparatorItem

export interface AppContextMenuProps {
  items: AppContextMenuItem[]
  children: ReactElement
  disabled?: boolean
}

export type RailItem = {
  type?: 'item'
  key: string
  label: string
  icon?: ReactNode
  disabled?: boolean
}

export type RailGroup = {
  type: 'group'
  label: string
}

export type RailEntry = RailItem | RailGroup

export interface AppShellProps {
  theme?: AppTheme
  contextMenu?: AppContextMenuMode
  clipboard?: AppClipboardAdapter
  contextMenuLocale?: Partial<AppContextMenuLocale>
  titleBar?: ReactNode
  rail?: ReactNode
  children?: ReactNode
  className?: string
  style?: CSSProperties
  contentClassName?: string
  contentStyle?: CSSProperties
}

export interface AppPageProps {
  title?: ReactNode
  description?: ReactNode
  actions?: ReactNode
  children?: ReactNode
  animated?: boolean
  className?: string
  style?: CSSProperties
  contentClassName?: string
  contentStyle?: CSSProperties
}

export interface AppRailProps {
  value?: string
  items: RailEntry[]
  footerItems?: RailItem[]
  onChange?: (key: string) => void
  collapsed?: boolean
  collapseBreakpoint?: number
  onCollapsedChange?: (collapsed: boolean) => void
  className?: string
  style?: CSSProperties
}

export interface AppTitleBarProps {
  title?: ReactNode
  icon?: ReactNode
  actions?: ReactNode
  onMinimize?: () => void
  maximized?: boolean
  onToggleMaximize?: () => void
  onClose?: () => void
  showMinimize?: boolean
  showMaximize?: boolean
  showClose?: boolean
  className?: string
  style?: CSSProperties
}
