import type { CSSProperties, ReactNode, RefObject } from 'react'

export interface AppSpotlightSurfaceProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ariaLabel: string
  children?: ReactNode
  initialFocusRef?: RefObject<HTMLElement | null>
  closeOnEscape?: boolean
  closeOnOutsideClick?: boolean
  closeOnWindowBlur?: boolean
  restoreFocus?: boolean
  width?: number | string
  topOffset?: number | string
  className?: string
  style?: CSSProperties
}
