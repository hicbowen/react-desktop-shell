import type { CSSProperties, ReactNode } from 'react'

export interface AppSettingsGroupProps {
  title?: ReactNode
  description?: ReactNode
  children: ReactNode
  className?: string
  style?: CSSProperties
}

export interface AppSettingsRowProps {
  title: ReactNode
  description?: ReactNode
  icon?: ReactNode
  control?: ReactNode
  disabled?: boolean
  className?: string
  style?: CSSProperties
}
