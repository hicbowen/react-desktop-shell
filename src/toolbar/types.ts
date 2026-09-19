import type { ReactNode } from 'react'
import type { AppButtonAppearance, AppButtonSize } from '../button'
import type { AppCommandReference } from '../command'

export type AppToolbarAppearance = 'surface' | 'flat'

export interface AppToolbarAction extends AppCommandReference {
  key?: string
  label?: ReactNode
  icon?: ReactNode
  onClick?: () => void
  disabled?: boolean
  danger?: boolean
  appearance?: AppButtonAppearance
  size?: AppButtonSize
}

export interface AppToolbarProps {
  appearance?: AppToolbarAppearance
  start?: ReactNode
  status?: ReactNode
  end?: ReactNode
  children?: ReactNode
  actions?: readonly AppToolbarAction[]
  overflowLabel?: string
  className?: string
}
