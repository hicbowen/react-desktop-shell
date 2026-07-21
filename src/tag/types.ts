import type { CSSProperties, ReactNode } from 'react'

export type AppTagColor = 'neutral' | 'brand' | 'blue' | 'teal' | 'green' | 'yellow' | 'orange' | 'red' | 'purple' | 'pink'
export type AppTagAppearance = 'subtle' | 'filled' | 'outline'

export interface AppTagProps {
  children: ReactNode
  color?: AppTagColor
  appearance?: AppTagAppearance
  size?: 'small' | 'standard'
  shape?: 'rounded' | 'circular'
  icon?: ReactNode
  onDismiss?: () => void
  dismissLabel?: string
  disabled?: boolean
  className?: string
  style?: CSSProperties
}
