import type {
  HTMLAttributes,
  MouseEventHandler,
  ReactNode,
} from 'react'

export type AppCardAppearance = 'filled' | 'outlined' | 'subtle'
export type AppCardOrientation = 'vertical' | 'horizontal'
export type AppCardPadding = 'none' | 'compact' | 'regular'

export interface AppCardProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onClick'> {
  children?: ReactNode
  appearance?: AppCardAppearance
  orientation?: AppCardOrientation
  padding?: AppCardPadding
  interactive?: boolean
  selected?: boolean
  disabled?: boolean
  onClick?: MouseEventHandler<HTMLDivElement>
}

export interface AppCardHeaderProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  icon?: ReactNode
  image?: ReactNode
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
}

export interface AppCardFooterProps extends HTMLAttributes<HTMLDivElement> {
  start?: ReactNode
  end?: ReactNode
  children?: ReactNode
  divided?: boolean
}

export interface AppCardGroupProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
  orientation?: AppCardOrientation
  divided?: boolean
}
