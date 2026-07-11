import type { CSSProperties, ReactNode } from 'react'

export type RailLinkItem = {
  type?: 'item'
  key: string
  label: string
  icon?: ReactNode
  badge?: ReactNode
  badgeAriaLabel?: string
  disabled?: boolean
}

export type RailItem = RailLinkItem

export type RailSubmenu = {
  type: 'submenu'
  key: string
  label: string
  icon?: ReactNode
  badge?: ReactNode
  badgeAriaLabel?: string
  disabled?: boolean
  children: RailLinkItem[]
}

export type RailGroup = {
  type: 'group'
  label: string
}

export type RailEntry = RailLinkItem | RailSubmenu | RailGroup

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

export type SelectionDirection = 'up' | 'down' | null

export type FlyoutState = {
  key: string
  rect: DOMRect
  value?: string
  themeStyle: CSSProperties
} | null
