import type { CSSProperties, ReactNode } from 'react'

export type AppNotificationStatus = 'neutral' | 'info' | 'success' | 'warning' | 'error'

export interface AppNotificationAction {
  key: string
  label: ReactNode
  disabled?: boolean
  primary?: boolean
}

export interface AppNotification {
  id: string
  title: ReactNode
  body?: ReactNode
  timestamp?: ReactNode
  status?: AppNotificationStatus
  icon?: ReactNode
  read?: boolean
  dismissible?: boolean
  actions?: readonly AppNotificationAction[]
}

export interface AppNotificationCenterProps {
  notifications: readonly AppNotification[]
  onInvoke?: (id: string) => void
  onAction?: (id: string, actionKey: string) => void
  onMarkRead?: (id: string, read: boolean) => void
  onMarkAllRead?: () => void
  onDismiss?: (id: string) => void
  onClearAll?: () => void
  ariaLabel?: string
  emptyContent?: ReactNode
  className?: string
  style?: CSSProperties
}

export interface AppNotificationIndicatorProps {
  notifications: readonly Pick<AppNotification, 'read'>[]
  max?: number
  ariaLabel?: string
  className?: string
}
