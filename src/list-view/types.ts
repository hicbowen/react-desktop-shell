import type { CSSProperties, ReactNode } from 'react'

interface AppListViewBaseProps {
  ariaLabel: string
  density?: 'compact' | 'standard'
  children: ReactNode
  className?: string
  style?: CSSProperties
}

interface AppListViewStaticProps {
  selectionMode?: 'none'
  activationMode?: 'selection'
  value?: never
  defaultValue?: never
  onValueChange?: never
  onItemInvoke?: never
}

interface AppListViewInvokeProps {
  selectionMode?: 'none'
  activationMode: 'invoke'
  onItemInvoke: (value: string) => void
  value?: never
  defaultValue?: never
  onValueChange?: never
}

interface AppListViewSelectionProps {
  selectionMode: 'single' | 'multiple'
  activationMode?: 'selection'
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  onItemInvoke?: never
}

export type AppListViewProps = AppListViewBaseProps & (
  | AppListViewStaticProps
  | AppListViewInvokeProps
  | AppListViewSelectionProps
)

export interface AppListViewItemProps {
  value: string
  icon?: ReactNode
  title: ReactNode
  description?: ReactNode
  secondaryText?: ReactNode
  trailing?: ReactNode
  disabled?: boolean
  interactive?: boolean
  className?: string
  style?: CSSProperties
}

export interface AppListViewItemInternalProps extends AppListViewItemProps {
  selected?: boolean
  tabIndex?: number
  selectionMode?: 'none' | 'single' | 'multiple'
  itemRole?: 'option' | 'listitem' | 'button'
  focusable?: boolean
  onItemClick?: (
    value: string,
    event: React.MouseEvent<HTMLDivElement>,
  ) => void
  onItemKeyDown?: (
    value: string,
    event: React.KeyboardEvent<HTMLDivElement>,
  ) => void
}
