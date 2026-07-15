import type { ReactElement, ReactNode } from 'react'
import type { AnchoredOverlayPlacement } from '../overlay/placement'

export interface AppMenuFlyoutItem {
  type?: 'item'
  key: string
  label: ReactNode
  icon?: ReactNode
  disabled?: boolean
  danger?: boolean
}

export interface AppMenuFlyoutSeparator {
  type: 'separator'
  key?: string
}

export type AppMenuFlyoutEntry =
  | AppMenuFlyoutItem
  | AppMenuFlyoutSeparator

export interface AppMenuFlyoutProps {
  children: ReactElement
  items: AppMenuFlyoutEntry[]
  onSelect?: (key: string) => void
  placement?: AnchoredOverlayPlacement
  disabled?: boolean
  ariaLabel?: string
  className?: string
  maxHeight?: number
  maxWidth?: number
}
