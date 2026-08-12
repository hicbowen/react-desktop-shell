import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'

export type AppQuickAskStatus =
  | 'idle'
  | 'submitting'
  | 'streaming'
  | 'awaiting-approval'
  | 'completed'
  | 'error'

export type AppQuickAskMessageRole = 'user' | 'assistant' | 'tool'

export interface AppQuickAskMessage {
  id: string
  role: AppQuickAskMessageRole
  content: ReactNode
  label?: ReactNode
}

export interface AppQuickAskThreadProps {
  messages: readonly AppQuickAskMessage[]
  ariaLabel?: string
  className?: string
  style?: CSSProperties
}

export interface AppPromptSuggestion {
  id: string
  label: ReactNode
  prompt: string
  description?: ReactNode
  icon?: ReactNode
  disabled?: boolean
}

export interface AppPromptSuggestionsProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  items: readonly AppPromptSuggestion[]
  onSelect: (item: AppPromptSuggestion) => void
  ariaLabel?: string
  disabled?: boolean
  size?: 'compact' | 'standard'
  className?: string
  style?: CSSProperties
}

export type AppAiActivityStatus =
  | 'thinking'
  | 'streaming'
  | 'searching'
  | 'tool'
  | 'awaiting-approval'
  | 'completed'
  | 'error'

export type AppAiActivityStepStatus =
  | 'pending'
  | 'active'
  | 'completed'
  | 'error'

export interface AppAiActivityStep {
  id: string
  label: ReactNode
  detail?: ReactNode
  status: AppAiActivityStepStatus
}

export interface AppAiActivityProps
  extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  status: AppAiActivityStatus
  label?: ReactNode
  detail?: ReactNode
  steps?: readonly AppAiActivityStep[]
  action?: ReactNode
  ariaLabel?: string
  size?: 'compact' | 'standard'
  className?: string
  style?: CSSProperties
}

export type AppToolApprovalStatus =
  'pending' | 'approved' | 'denied' | 'running' | 'completed' | 'error'

export interface AppToolApprovalCardProps {
  title: ReactNode
  description?: ReactNode
  details?: ReactNode
  status?: AppToolApprovalStatus
  danger?: boolean
  approveText?: ReactNode
  rejectText?: ReactNode
  onApprove?: () => void
  onReject?: () => void
  className?: string
  style?: CSSProperties
}

export interface AppQuickAskProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (prompt: string) => void
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  status?: AppQuickAskStatus
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
