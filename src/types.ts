import type { CSSProperties, ReactElement, ReactNode } from 'react'

export type AppTheme = 'system' | 'light' | 'dark'
export type AppContextMenuMode = 'native' | 'app'

export interface AppClipboardAdapter {
  readText(): Promise<string>
  writeText(text: string): Promise<void>
}

export interface AppContextMenuLocale {
  undo: string
  cut: string
  copy: string
  paste: string
  delete: string
  selectAll: string
}

export interface AppContextMenuActionItem {
  key: string
  label: ReactNode
  icon?: ReactNode
  shortcut?: ReactNode
  disabled?: boolean
  danger?: boolean
  onClick?: () => void
}

export interface AppContextMenuSubmenuItem {
  key: string
  label: ReactNode
  icon?: ReactNode
  disabled?: boolean
  danger?: boolean
  submenu: AppContextMenuItem[]
}

export interface AppContextMenuSeparatorItem {
  type: 'separator'
}

export type AppContextMenuItem =
  | AppContextMenuActionItem
  | AppContextMenuSubmenuItem
  | AppContextMenuSeparatorItem

export interface AppContextMenuProps {
  items: AppContextMenuItem[]
  children: ReactElement
  disabled?: boolean
}

export interface AppDialogProps {
  open: boolean
  onOpenChange?: (open: boolean) => void
  title?: ReactNode
  description?: ReactNode
  children?: ReactNode
  actions?: ReactNode
  closeOnEscape?: boolean
  closeOnOverlayClick?: boolean
  initialFocus?: React.RefObject<HTMLElement | null>
  width?: number | string
  className?: string
}

export interface AppMessageBoxButton {
  key: string
  label: ReactNode
  primary?: boolean
  danger?: boolean
  disabled?: boolean
}

export interface AppMessageBoxOptions {
  title?: ReactNode
  message?: ReactNode
  icon?: ReactNode
  buttons: AppMessageBoxButton[]
  defaultButton?: string
  cancelButton?: string
  closeOnEscape?: boolean
}

export interface AppMessageBoxConfirmOptions {
  title?: ReactNode
  message?: ReactNode
  icon?: ReactNode
  confirmText?: ReactNode
  cancelText?: ReactNode
  danger?: boolean
}

export interface AppMessageBox {
  show(options: AppMessageBoxOptions): Promise<string | undefined>
  confirm(options: AppMessageBoxConfirmOptions): Promise<boolean>
}

export interface AppMessageBoxLocale {
  confirm: string
  cancel: string
}

export type AppToastId = string

export type AppToastStatus =
  | 'default'
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'loading'

export interface AppToastAction {
  label: ReactNode
  onClick: () => void
}

export interface AppToastOptions {
  id?: AppToastId
  title: ReactNode
  message?: ReactNode
  status?: AppToastStatus
  icon?: ReactNode
  duration?: number
  closable?: boolean
  action?: AppToastAction
}

export type AppToastUpdateOptions = Partial<Omit<AppToastOptions, 'id'>>

export interface AppToastShortcutOptions {
  id?: AppToastId
  message?: ReactNode
  icon?: ReactNode
  duration?: number
  closable?: boolean
  action?: AppToastAction
}

export interface AppToast {
  show(options: AppToastOptions): AppToastId
  update(id: AppToastId, options: AppToastUpdateOptions): void
  dismiss(id: AppToastId): void
  dismissAll(): void
  success(title: ReactNode, options?: AppToastShortcutOptions): AppToastId
  error(title: ReactNode, options?: AppToastShortcutOptions): AppToastId
  warning(title: ReactNode, options?: AppToastShortcutOptions): AppToastId
  info(title: ReactNode, options?: AppToastShortcutOptions): AppToastId
}

export interface AppToastLocale {
  dismiss: string
}

export interface AppToastHostOptions {
  maxVisible?: number
}

export type RailItem = {
  type?: 'item'
  key: string
  label: string
  icon?: ReactNode
  disabled?: boolean
}

export type RailGroup = {
  type: 'group'
  label: string
}

export type RailEntry = RailItem | RailGroup

export interface AppShellProps {
  theme?: AppTheme
  contextMenu?: AppContextMenuMode
  clipboard?: AppClipboardAdapter
  contextMenuLocale?: Partial<AppContextMenuLocale>
  messageBoxLocale?: Partial<AppMessageBoxLocale>
  toastLocale?: Partial<AppToastLocale>
  toastOptions?: AppToastHostOptions
  titleBar?: ReactNode
  rail?: ReactNode
  children?: ReactNode
  className?: string
  style?: CSSProperties
  contentClassName?: string
  contentStyle?: CSSProperties
}

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

export interface AppRailProps {
  value?: string
  items: RailEntry[]
  footerItems?: RailItem[]
  onChange?: (key: string) => void
  collapsed?: boolean
  collapseBreakpoint?: number
  onCollapsedChange?: (collapsed: boolean) => void
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
