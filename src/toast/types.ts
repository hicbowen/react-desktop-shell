import type { ReactNode } from 'react'

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
