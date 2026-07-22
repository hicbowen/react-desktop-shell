import type { CSSProperties, ReactNode } from 'react'

export type AppInlineEditSelection = 'all' | 'basename' | 'end' | 'preserve'

export interface AppInlineEditHandle {
  input: HTMLInputElement | null
  focus: () => void
  startEditing: () => void
  cancel: () => void
  commit: () => Promise<boolean>
}

export interface AppInlineEditProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  onCommit?: (value: string, previousValue: string) => void | Promise<void>
  onCommitError?: (error: unknown) => void
  validate?: (value: string) => ReactNode | null | Promise<ReactNode | null>
  editing?: boolean
  defaultEditing?: boolean
  onEditingChange?: (editing: boolean) => void
  selection?: AppInlineEditSelection
  commitOnBlur?: boolean
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  placeholder?: string
  ariaLabel?: string
  showActions?: boolean
  renderValue?: (value: string) => ReactNode
  className?: string
  style?: CSSProperties
}
