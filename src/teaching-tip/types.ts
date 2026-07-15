import type { ReactElement, ReactNode } from 'react'
import type { AnchoredOverlayPlacement } from '../overlay/placement'

export interface AppTeachingTipAction {
  label: ReactNode
  onClick: () => void
}

export interface AppTeachingTipProps {
  children: ReactElement
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: ReactNode
  content: ReactNode
  primaryAction?: AppTeachingTipAction
  secondaryAction?: AppTeachingTipAction
  placement?: AnchoredOverlayPlacement
  maxWidth?: number
  dismissible?: boolean
  closeOnOutsidePointerDown?: boolean
  ariaLabel?: string
  closeAriaLabel?: string
  className?: string
}
