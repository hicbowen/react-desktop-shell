import type { CSSProperties, ReactNode } from 'react'

export interface AppFieldProps {
  label: ReactNode
  description?: ReactNode
  required?: boolean
  error?: ReactNode
  disabled?: boolean
  orientation?: 'vertical' | 'horizontal'
  labelWidth?: number | string
  htmlFor?: string
  children: ReactNode
  className?: string
  style?: CSSProperties
}
