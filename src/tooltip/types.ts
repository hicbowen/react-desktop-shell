import type { ReactElement, ReactNode } from 'react'

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
}
