import type { CSSProperties, ReactNode } from 'react'
import type { AppCommand } from '../command'

export interface AppMenuBarItem {
  type?: 'item'
  key: string
  label?: ReactNode
  icon?: ReactNode
  shortcut?: string
  disabled?: boolean
  checked?: boolean
  danger?: boolean
  command?: AppCommand
}

export interface AppMenuBarMenu {
  key: string
  label: ReactNode
  accessKey?: string
  items: readonly (AppMenuBarItem | { type: 'separator'; key?: string })[]
}

export interface AppMenuBarProps {
  menus: readonly AppMenuBarMenu[]
  onSelect?: (itemKey: string, menuKey: string) => void
  ariaLabel?: string
  className?: string
  style?: CSSProperties
}
