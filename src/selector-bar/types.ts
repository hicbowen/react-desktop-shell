import type { CSSProperties, ReactNode } from 'react'

export interface AppSelectorBarItem {
  key: string
  label?: ReactNode
  icon?: ReactNode
  disabled?: boolean
  ariaLabel?: string
  panelId?: string
}

export interface AppSelectorBarProps {
  items: AppSelectorBarItem[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** @deprecated Use onValueChange instead. */
  onChange?: (key: string) => void
  size?: 'small' | 'medium'
  disabled?: boolean
  ariaLabel?: string
  className?: string
  style?: CSSProperties
}

export type AppSelectorPanelMountStrategy = 'unmount' | 'hidden'

export interface AppSelectorPanelsProps {
  value?: string
  mountStrategy?: AppSelectorPanelMountStrategy
  children: ReactNode
  className?: string
}

export interface AppSelectorPanelProps {
  value: string
  children: ReactNode
  id?: string
  labelledBy?: string
  className?: string
}
