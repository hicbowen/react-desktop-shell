import type { CSSProperties, ReactNode } from 'react'
export interface AppBreadcrumbItem { key: string; label: ReactNode; icon?: ReactNode; disabled?: boolean }
export interface AppBreadcrumbBarProps { items: readonly AppBreadcrumbItem[]; onItemSelect?: (key: string) => void; maxVisibleItems?: number; ariaLabel?: string; overflowLabel?: string; className?: string; style?: CSSProperties }
