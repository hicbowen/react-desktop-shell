import type { CSSProperties, ReactNode } from 'react'

export type RailItem = {
  type?: 'item'
  key: string
  label: string
  icon?: ReactNode
}

export type RailGroup = {
  type: 'group'
  label: string
}

export type RailEntry = RailItem | RailGroup

export interface AppShellProps {
  titleBar?: ReactNode
  rail?: ReactNode
  children?: ReactNode
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
