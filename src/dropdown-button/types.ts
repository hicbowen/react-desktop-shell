import type { ReactNode } from 'react'
import type { AppButtonProps } from '../button'
import type { AppMenuFlyoutEntry } from '../menu-flyout'
import type { AnchoredOverlayPlacement } from '../overlay/placement'

export interface AppDropDownButtonProps extends Omit<AppButtonProps, 'children' | 'iconPosition' | 'onClick' | 'onSelect'> {
  children: ReactNode
  items: AppMenuFlyoutEntry[]
  onSelect?: (key: string) => void
  placement?: AnchoredOverlayPlacement
  menuAriaLabel?: string
}
