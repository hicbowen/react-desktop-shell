import type { CSSProperties, ReactNode } from 'react'

interface AppListViewBaseProps {
  ariaLabel: string
  density?: 'compact' | 'standard'
  children: ReactNode
  className?: string
  style?: CSSProperties
  /** Enables fixed-row virtualization for large lists. */
  virtualization?: boolean | AppListViewVirtualizationOptions
  /** Enables first-character and incremental keyboard search. */
  typeahead?: boolean
}

export interface AppListViewVirtualizationOptions {
  itemHeight?: number
  overscan?: number
  viewportHeight?: number
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
  /** Plain text used by keyboard typeahead when title is not a string. */
  textValue?: string
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
  selectionName?: string
  itemRole?: 'listitem' | 'button'
  focusable?: boolean
  onItemSelect?: (value: string, event?: { shiftKey?: boolean }) => void
  onItemClick?: (
    value: string,
    event: React.MouseEvent<HTMLDivElement>,
  ) => void
  onItemKeyDown?: (
    value: string,
    event: React.KeyboardEvent<HTMLElement>,
  ) => void
}
