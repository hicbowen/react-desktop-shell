import type { ReactElement, ReactNode, RefObject } from 'react'

export type AppTooltipPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end'

export interface AppTooltipProps {
  content: ReactNode
  children: ReactElement
  placement?: AppTooltipPlacement
  delay?: number
  disabled?: boolean
  maxWidth?: number
  className?: string
  /** Use a separate element for overlay geometry while the child remains the interaction target. */
  anchorRef?: RefObject<HTMLElement | null>
  /** Values that should trigger a fresh anchor measurement while the tooltip is open. */
  positionDependencies?: readonly unknown[]
}
