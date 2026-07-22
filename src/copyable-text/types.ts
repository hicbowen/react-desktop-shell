import type { CSSProperties, ReactNode } from 'react'

export interface AppCopyableTextProps {
  text: string
  children?: ReactNode
  copy?: (text: string) => void | Promise<void>
  onCopy?: (text: string) => void
  onCopyError?: (error: unknown) => void
  copiedDuration?: number
  disabled?: boolean
  truncate?: boolean
  className?: string
  style?: CSSProperties
}
