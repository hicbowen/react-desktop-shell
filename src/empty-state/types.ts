import type { CSSProperties, ReactNode } from 'react'
export interface AppEmptyStateProps {
  icon?: ReactNode
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  appearance?: 'regular' | 'compact'
  align?: 'start' | 'center'
  className?: string
  style?: CSSProperties
}
