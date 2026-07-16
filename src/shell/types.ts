import type { CSSProperties, ReactNode } from 'react'
import type {
  AppClipboardAdapter,
  AppContextMenuMode,
} from '../context-menu/types'
import type { AppToastHostOptions } from '../toast/types'
import type { AppLocale } from '../localization/types'

export type AppTheme = 'system' | 'light' | 'dark'
export type PaneDisplayMode = 'expanded' | 'compact' | 'minimal' | 'auto'

export interface AppShellProps {
  locale?: AppLocale
  theme?: AppTheme
  contextMenu?: AppContextMenuMode
  clipboard?: AppClipboardAdapter
  toastOptions?: AppToastHostOptions
  title?: ReactNode
  icon?: ReactNode
  sidebar?: AppShellSidebarOptions
  sidebarHeader?: ReactNode
  titleBar?: ReactNode
  rail?: ReactNode
  children?: ReactNode
  className?: string
  style?: CSSProperties
  contentClassName?: string
  contentStyle?: CSSProperties
}

export interface AppShellSidebarOptions {
  collapsible?: boolean
  displayMode?: PaneDisplayMode
  defaultDisplayMode?: PaneDisplayMode
  onDisplayModeChange?: (mode: PaneDisplayMode) => void
  isPaneOpen?: boolean
  defaultPaneOpen?: boolean
  onPaneOpenChange?: (open: boolean) => void
  expandedBreakpoint?: number
  compactBreakpoint?: number
  /** @deprecated Use displayMode instead. */
  collapsed?: boolean
  /** @deprecated Use defaultDisplayMode instead. */
  defaultCollapsed?: boolean
  /** @deprecated Use onDisplayModeChange instead. */
  onCollapsedChange?: (collapsed: boolean) => void
  expandedWidth?: number
  compactWidth?: number
}
