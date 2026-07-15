import type { ReactNode } from 'react'
import type { AppMenuFlyoutEntry } from '../menu-flyout/types'
import type { AnchoredOverlayPlacement } from '../overlay/placement'

export interface AppSplitButtonProps {
  label: ReactNode
  items: AppMenuFlyoutEntry[]
  onClick?: () => void
  onSelect?: (key: string) => void
  icon?: ReactNode
  disabled?: boolean
  menuDisabled?: boolean
  placement?: AnchoredOverlayPlacement
  ariaLabel?: string
  menuAriaLabel?: string
  className?: string
}
