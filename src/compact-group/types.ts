import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'

export interface AppCompactGroupProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  children: ReactNode
  direction?: 'horizontal' | 'vertical'
  fullWidth?: boolean
}

export interface AppControlAddonProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  children: ReactNode
  size?: 'compact' | 'standard'
  style?: CSSProperties
}
