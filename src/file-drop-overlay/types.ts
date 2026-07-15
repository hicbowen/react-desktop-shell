import type { ReactNode } from 'react'

export interface AppFileDropOverlayProps {
  onFiles: (files: File[]) => void
  accept?: string[]
  multiple?: boolean
  disabled?: boolean
  title?: ReactNode
  description?: ReactNode
  icon?: ReactNode
  rejectTitle?: ReactNode
  rejectDescription?: ReactNode
  className?: string
  children?: ReactNode
}
