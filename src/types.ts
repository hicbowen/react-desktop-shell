import type { CSSProperties, ReactNode } from 'react'

export type {
  AppClipboardAdapter,
  AppContextMenuActionItem,
  AppContextMenuItem,
  AppContextMenuLocale,
  AppContextMenuMode,
  AppContextMenuProps,
  AppContextMenuSeparatorItem,
  AppContextMenuSubmenuItem,
} from './context-menu/types'
export type {
  AppDialogProps,
  AppMessageBox,
  AppMessageBoxButton,
  AppMessageBoxConfirmOptions,
  AppMessageBoxLocale,
  AppMessageBoxOptions,
} from './dialog/types'
export type { AppInfoBarProps, AppInfoBarStatus } from './info-bar/types'
export type {
  AppRailProps,
  RailEntry,
  RailGroup,
  RailItem,
  RailLinkItem,
  RailSubmenu,
} from './navigation/types'
export type {
  AppShellProps,
  AppShellSidebarOptions,
  AppTheme,
  PaneDisplayMode,
} from './shell/types'
export type {
  AppToast,
  AppToastAction,
  AppToastHostOptions,
  AppToastId,
  AppToastLocale,
  AppToastOptions,
  AppToastShortcutOptions,
  AppToastStatus,
  AppToastUpdateOptions,
} from './toast/types'

export interface AppPageProps {
  title?: ReactNode
  description?: ReactNode
  actions?: ReactNode
  children?: ReactNode
  sidePane?: ReactNode
  animated?: boolean
  className?: string
  style?: CSSProperties
  contentClassName?: string
  contentStyle?: CSSProperties
}

export interface AppSidePaneProps {
  open: boolean
  title?: ReactNode
  children: ReactNode
  width?: number
  defaultWidth?: number
  minWidth?: number
  maxWidth?: number
  resizable?: boolean
  onWidthChange?: (width: number) => void
  onClose?: () => void
  footer?: ReactNode
  className?: string
  style?: CSSProperties
}

export interface AppTitleBarProps {
  title?: ReactNode
  icon?: ReactNode
  actions?: ReactNode
  onMinimize?: () => void
  maximized?: boolean
  onToggleMaximize?: () => void
  onClose?: () => void
  showMinimize?: boolean
  showMaximize?: boolean
  showClose?: boolean
  className?: string
  style?: CSSProperties
}
