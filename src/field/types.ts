import type { CSSProperties, ReactNode } from 'react'

export interface AppFieldProps {
  id?: string
  messageId?: string
  label: ReactNode
  description?: ReactNode
  required?: boolean
  error?: ReactNode
  disabled?: boolean
  orientation?: 'vertical' | 'horizontal'
  labelAlign?: 'start' | 'end'
  labelWidth?: number | string
  htmlFor?: string
  requiredIndicator?: ReactNode
  children: ReactNode
  className?: string
  style?: CSSProperties
}
