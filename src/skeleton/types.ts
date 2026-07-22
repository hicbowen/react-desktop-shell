import type { CSSProperties, ReactNode } from 'react'

export type AppSkeletonShape = 'text' | 'rectangle' | 'circle'

export interface AppSkeletonProps {
  shape?: AppSkeletonShape
  width?: CSSProperties['width']
  height?: CSSProperties['height']
  lines?: number
  animated?: boolean
  className?: string
  style?: CSSProperties
}

export interface AppSkeletonGroupProps {
  children: ReactNode
  label?: string
  className?: string
  style?: CSSProperties
}
