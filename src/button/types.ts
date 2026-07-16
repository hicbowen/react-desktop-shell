import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type AppButtonAppearance = 'standard' | 'primary' | 'subtle' | 'danger'
export type AppButtonSize = 'compact' | 'standard'

export interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  appearance?: AppButtonAppearance
  size?: AppButtonSize
  icon?: ReactNode
  iconPosition?: 'start' | 'end'
  loading?: boolean
  block?: boolean
}

export interface AppIconButtonProps extends Omit<AppButtonProps, 'block' | 'children' | 'iconPosition'> {
  icon: ReactNode
  ariaLabel?: string
  shape?: 'circular' | 'rounded'
}
