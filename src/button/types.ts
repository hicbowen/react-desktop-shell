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

type AppIconButtonBaseProps = Omit<AppButtonProps, 'aria-label' | 'aria-labelledby' | 'block' | 'children' | 'iconPosition'> & {
  icon: ReactNode
  shape?: 'circular' | 'rounded'
}

type AccessibleIconButtonLabel =
  | { ariaLabel: string; 'aria-label'?: string; 'aria-labelledby'?: string }
  | { ariaLabel?: string; 'aria-label': string; 'aria-labelledby'?: string }
  | { ariaLabel?: string; 'aria-label'?: string; 'aria-labelledby': string }

export type AppIconButtonProps = AppIconButtonBaseProps & AccessibleIconButtonLabel
