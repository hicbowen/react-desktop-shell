import type { MouseEventHandler, ReactNode } from 'react'
import type { AppButtonSize } from '../button/types'
import type { AppMenuFlyoutEntry } from '../menu-flyout/types'
import type { AnchoredOverlayPlacement } from '../overlay/placement'

export interface AppSplitButtonProps {
  label: ReactNode
  items: AppMenuFlyoutEntry[]
  onClick?: MouseEventHandler<HTMLButtonElement>
  onSelect?: (key: string) => void
  icon?: ReactNode
  disabled?: boolean
  menuDisabled?: boolean
  placement?: AnchoredOverlayPlacement
  ariaLabel?: string
  size?: AppButtonSize
  className?: string
}
