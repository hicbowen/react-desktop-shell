import type { CSSProperties, ReactNode } from 'react'
import type { AppAiRunStatus } from '../ai/types'

export interface AppQuickAskProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (prompt: string) => void
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  status?: AppAiRunStatus
  answer?: ReactNode
  error?: ReactNode
  answerActions?: ReactNode
  footer?: ReactNode
  leadingIcon?: ReactNode
  onCancel?: () => void
  clearOnSubmit?: boolean
  followOutput?: boolean
  disabled?: boolean
  placeholder?: string
  ariaLabel?: string
  inputAriaLabel?: string
  responseAriaLabel?: string
  closeOnOutsideClick?: boolean
  closeOnWindowBlur?: boolean
  width?: number | string
  className?: string
  style?: CSSProperties
}
