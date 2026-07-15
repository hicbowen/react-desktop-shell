import type { CSSProperties, ReactNode } from 'react'
import type { FileDropRejectionReason } from './fileAcceptance'

export interface AppFileDropOverlayProps {
  onFiles: (files: File[]) => void
  onReject?: (files: File[], reason: FileDropRejectionReason) => void
  accept?: string[]
  multiple?: boolean
  disabled?: boolean
  title?: ReactNode
  description?: ReactNode
  icon?: ReactNode
  rejectTitle?: ReactNode
  rejectDescription?: ReactNode
  className?: string
  style?: CSSProperties
  children?: ReactNode
}
