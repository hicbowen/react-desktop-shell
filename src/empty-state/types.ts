import type { CSSProperties, ElementType, HTMLAttributes, ReactNode } from 'react'

export type AppEmptyStateSize = 'small' | 'medium' | 'large'
export type AppEmptyStateLayout = 'content' | 'fill' | 'inline'
export type AppEmptyStateVisual = 'default' | 'simple' | 'none' | ReactNode
export type AppEmptyStateSlot = 'root' | 'visual' | 'title' | 'description' | 'actions'

export interface AppEmptyStateProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  icon?: ReactNode
  title?: ReactNode
  description?: ReactNode
  action?: ReactNode
  actions?: ReactNode
  visual?: AppEmptyStateVisual
  size?: AppEmptyStateSize
  layout?: AppEmptyStateLayout
  appearance?: 'regular' | 'compact'
  align?: 'start' | 'center'
  classNames?: Partial<Record<AppEmptyStateSlot, string>>
  styles?: Partial<Record<AppEmptyStateSlot, CSSProperties>>
  as?: ElementType
  className?: string
  style?: CSSProperties
}
