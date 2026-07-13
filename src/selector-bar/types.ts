import type { CSSProperties, ReactNode } from 'react'

export interface AppSelectorBarItem {
  key: string
  label?: ReactNode
  icon?: ReactNode
  disabled?: boolean
  ariaLabel?: string
}

export interface AppSelectorBarProps {
  items: AppSelectorBarItem[]
  value?: string
  defaultValue?: string
  onChange?: (key: string) => void
  size?: 'small' | 'medium'
  disabled?: boolean
  ariaLabel?: string
  className?: string
  style?: CSSProperties
}
