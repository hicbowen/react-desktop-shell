import type { CSSProperties, ReactNode } from 'react'

export interface AppTreeItem {
  key: string
  label: ReactNode
  icon?: ReactNode
  children?: readonly AppTreeItem[]
  disabled?: boolean
  hasChildren?: boolean
  loading?: boolean
}

export interface AppTreeDropInfo {
  sourceKey: string
  targetKey: string
  position: 'inside'
}

export interface AppTreeViewProps {
  items: readonly AppTreeItem[]
  ariaLabel?: string
  selectionMode?: 'none' | 'single' | 'multiple'
  selectedKeys?: readonly string[]
  defaultSelectedKeys?: readonly string[]
  onSelectedKeysChange?: (keys: string[]) => void
  expandedKeys?: readonly string[]
  defaultExpandedKeys?: readonly string[]
  onExpandedKeysChange?: (keys: string[]) => void
  onItemInvoke?: (item: AppTreeItem) => void
  onLoadChildren?: (item: AppTreeItem) => void | Promise<void>
  onItemDrop?: (info: AppTreeDropInfo) => void
  className?: string
  style?: CSSProperties
}
