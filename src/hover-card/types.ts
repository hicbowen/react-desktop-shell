import type {
  CSSProperties,
  ReactElement,
  ReactNode,
} from 'react'
import type { AnchoredOverlayPlacement } from '../overlay/placement'

export interface AppHoverCardProps {
  children: ReactElement
  content: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  placement?: AnchoredOverlayPlacement
  openDelay?: number
  closeDelay?: number
  openOnClick?: boolean
  disabled?: boolean
  offset?: number
  maxWidth?: number
  ariaLabel?: string
  className?: string
  style?: CSSProperties
}
