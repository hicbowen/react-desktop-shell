import type { ReactElement, ReactNode } from 'react'
import type { AnchoredOverlayPlacement } from '../overlay/placement'
import type { AppCommandReference } from '../command/types'

export interface AppMenuFlyoutItem extends AppCommandReference {
  type?: 'item'
  key: string
  label?: ReactNode
  icon?: ReactNode
  disabled?: boolean
  danger?: boolean
  checked?: boolean
  shortcut?: string
}

export interface AppMenuFlyoutSubmenu extends AppCommandReference {
  type: 'submenu'
  key: string
  label?: ReactNode
  icon?: ReactNode
  disabled?: boolean
  danger?: boolean
  items: readonly AppMenuFlyoutEntry[]
}

export interface AppMenuFlyoutSeparator {
  type: 'separator'
  key?: string
}

export type AppMenuFlyoutEntry =
  | AppMenuFlyoutItem
  | AppMenuFlyoutSubmenu
  | AppMenuFlyoutSeparator

export interface AppMenuFlyoutProps {
  children: ReactElement
  items: readonly AppMenuFlyoutEntry[]
  onSelect?: (key: string) => void
  placement?: AnchoredOverlayPlacement
  disabled?: boolean
  ariaLabel?: string
  className?: string
  maxHeight?: number
  maxWidth?: number
}
