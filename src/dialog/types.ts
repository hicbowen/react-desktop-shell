import type { ReactNode } from 'react'

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
