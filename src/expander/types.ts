import type {
  CSSProperties,
  HTMLAttributes,
  ReactNode,
} from 'react'

export type AppExpanderGroupExpansionMode =
  | 'independent'
  | 'single'
  | 'multiple'

export type AppExpanderGroupValue = string | readonly string[] | null

export interface AppExpanderGroupProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue'> {
  expansionMode?: AppExpanderGroupExpansionMode
  value?: AppExpanderGroupValue
  defaultValue?: AppExpanderGroupValue
  onValueChange?: (value: string | string[] | null) => void
  collapsible?: boolean
}

export interface AppExpanderProps {
  title: ReactNode
  description?: ReactNode
  icon?: ReactNode
  value?: string
  expanded?: boolean
  defaultExpanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
  disabled?: boolean
  actions?: ReactNode
  appearance?: 'default' | 'subtle'
  children: ReactNode
  className?: string
  style?: CSSProperties
}
