import type { CSSProperties, MouseEvent, ReactNode } from 'react'

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
  /**
   * Called when the user requests a context menu for a tab.
   *
   * Call event.preventDefault() when displaying a custom context menu.
   */
  onTabContextMenu?: (
    item: AppTabViewItem,
    event: MouseEvent<HTMLDivElement>,
  ) => void
  onAddTab?: () => void
  ariaLabel?: string
  addTabLabel?: string
  closeTabLabel?: (item: AppTabViewItem) => string
  mountStrategy?: 'hidden' | 'unmount'
  className?: string
  style?: CSSProperties
}
