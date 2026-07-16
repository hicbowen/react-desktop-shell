import type { ReactNode } from 'react'

export type AppInfoBarStatus = 'info' | 'success' | 'warning' | 'error'

export interface AppInfoBarProps {
  status?: AppInfoBarStatus
  title?: ReactNode
  message?: ReactNode
  icon?: ReactNode
  action?: ReactNode
  dismissible?: boolean
  onDismiss?: () => void
  className?: string
  children?: ReactNode
}
