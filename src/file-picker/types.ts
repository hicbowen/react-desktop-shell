import type { CSSProperties } from 'react'

export type AppFilePickerRejectionReason = 'type' | 'multiple' | 'size'

export interface AppFilePickerAdapter {
  pick(options: { accept?: readonly string[]; multiple: boolean }): Promise<readonly File[]>
}

export interface AppFilePickerProps {
  files?: readonly File[]
  defaultFiles?: readonly File[]
  onFilesChange?: (files: File[]) => void
  onReject?: (files: File[], reason: AppFilePickerRejectionReason) => void
  accept?: readonly string[]
  multiple?: boolean
  maxFileSize?: number
  disabled?: boolean
  allowDrop?: boolean
  adapter?: AppFilePickerAdapter
  className?: string
  style?: CSSProperties
}
