import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import type { Components } from 'react-markdown'

/** The lifecycle of the current AI run, not the conversation or a message. */
export type AppAiRunStatus =
  | 'idle'
  | 'thinking'
  | 'responding'
  | 'searching'
  | 'using-tool'
  | 'awaiting-approval'
  | 'awaiting-review'
  | 'completed'
  | 'error'
  | 'canceled'

export type AppAiComposerAppearance = 'surface' | 'embedded'

export type AppAiMarkdownComponents = Components

export interface AppAiMarkdownProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children'
> {
  content: string
  components?: AppAiMarkdownComponents
  copyCode?: boolean
  highlightCode?: boolean
  onCopyCode?: (code: string) => void | Promise<void>
}

export interface AppAiComposerProps {
  onSubmit: (prompt: string) => void
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Response-generation state; tool lifecycle stays in the message stream. */
  runStatus?: AppAiRunStatus
  onCancel?: () => void
  clearOnSubmit?: boolean
  disabled?: boolean
  placeholder?: string
  appearance?: AppAiComposerAppearance
  header?: ReactNode
  toolbarStart?: ReactNode
  toolbarEnd?: ReactNode
  minRows?: number
  maxRows?: number
  leadingIcon?: ReactNode
  submitIcon?: ReactNode
  cancelIcon?: ReactNode
  inputAriaLabel?: string
  toolbarAriaLabel?: string
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

export interface AppPromptSuggestionsProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onSelect'
> {
  items: readonly AppPromptSuggestion[]
  onSelect: (item: AppPromptSuggestion) => void
  ariaLabel?: string
  columns?: 1 | 2 | 3 | 4
  disabled?: boolean
  size?: 'compact' | 'standard'
  className?: string
  style?: CSSProperties
}

export type AppAiMessageFeedback = 'like' | 'dislike' | null

export interface AppAiMessageActionsProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange'
> {
  onCopy?: () => void
  onRetry?: () => void
  onEdit?: () => void
  feedback?: AppAiMessageFeedback
  onFeedbackChange?: (feedback: AppAiMessageFeedback) => void
  disabled?: boolean
  ariaLabel?: string
  visibility?: 'always' | 'hover'
  children?: ReactNode
}

export interface AppAiRunIndicatorProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'title'
> {
  status: AppAiRunStatus
  label?: ReactNode
  detail?: ReactNode
  action?: ReactNode
  ariaLabel?: string
  appearance?: 'inline' | 'card'
  className?: string
  style?: CSSProperties
}

/** The lifecycle of one tool call, including its approval decision. */
export type AppToolCallStatus =
  | 'awaiting-approval'
  | 'running'
  | 'completed'
  | 'rejected'
  | 'canceled'
  | 'error'

/** Lightweight activity cannot represent an approval decision on its own. */
export type AppToolActivityStatus = Exclude<
  AppToolCallStatus,
  'awaiting-approval' | 'rejected'
>

export interface AppToolCallCardProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'children' | 'title'
> {
  title: ReactNode
  description?: ReactNode
  details?: ReactNode
  status?: AppToolCallStatus
  statusLabel?: ReactNode
  danger?: boolean
  approveText?: ReactNode
  rejectText?: ReactNode
  cancelText?: ReactNode
  onApprove?: () => void
  onReject?: () => void
  onCancel?: () => void
  expanded?: boolean
  defaultExpanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
  ariaLabel?: string
}

export interface AppToolActivityProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'children' | 'title'
> {
  title: ReactNode
  description?: ReactNode
  status?: AppToolActivityStatus
  statusLabel?: ReactNode
  onCancel?: () => void
  cancelText?: ReactNode
  ariaLabel?: string
}

export interface AppToolCallGroupItem {
  id: string
  title: ReactNode
  description?: ReactNode
  status: AppToolActivityStatus
  statusLabel?: ReactNode
  ariaLabel?: string
}

export interface AppToolCallGroupProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'children' | 'title'
> {
  items: readonly AppToolCallGroupItem[]
  title?: ReactNode
  description?: ReactNode
  statusLabel?: ReactNode
  expanded?: boolean
  defaultExpanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
  onCancel?: (item: AppToolCallGroupItem) => void
  cancelText?: ReactNode
  ariaLabel?: string
}

/** The lifecycle of reviewing and applying one proposed change set. */
export type AppChangeReviewStatus =
  'awaiting-review' | 'applying' | 'applied' | 'rejected' | 'error'

export interface AppChangeReviewFile {
  id: string
  path: ReactNode
  summary?: ReactNode
  additions?: number
  deletions?: number
  diff?: ReactNode
}

export interface AppChangeReviewCardProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'title'
> {
  files: readonly AppChangeReviewFile[]
  title?: ReactNode
  description?: ReactNode
  status?: AppChangeReviewStatus
  danger?: boolean
  expanded?: boolean
  defaultExpanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
  onApply?: () => void
  onReject?: () => void
  applyText?: ReactNode
  rejectText?: ReactNode
  ariaLabel?: string
  size?: 'compact' | 'standard'
  className?: string
  style?: CSSProperties
}
