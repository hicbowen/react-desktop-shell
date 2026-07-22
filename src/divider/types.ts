import type { CSSProperties, ReactNode } from 'react'

export interface AppDividerProps {
  children?: ReactNode
  orientation?: 'horizontal' | 'vertical'
  appearance?: 'subtle' | 'strong'
  align?: 'start' | 'center' | 'end'
  inset?: boolean
  className?: string
  style?: CSSProperties
}
