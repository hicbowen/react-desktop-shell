import type { CSSProperties, ReactNode } from 'react'

export interface AppTabViewItem {
  key: string
  label: ReactNode
  content: ReactNode
  icon?: ReactNode
  closeable?: boolean
  disabled?: boolean
  dirty?: boolean
  pinned?: boolean
}

export interface AppTabViewProps {
  items: readonly AppTabViewItem[]
  value?: string
  defaultValue?: string
  onValueChange?: (key: string) => void
  onTabClose?: (key: string) => void
  onTabReorder?: (fromIndex: number, toIndex: number) => void
  onAddTab?: () => void
  ariaLabel?: string
  addTabLabel?: string
  closeTabLabel?: (item: AppTabViewItem) => string
  mountStrategy?: 'hidden' | 'unmount'
  className?: string
  style?: CSSProperties
}
