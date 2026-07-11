import type { ReactNode } from 'react'

export interface AppToolbarProps {
  start?: ReactNode
  status?: ReactNode
  /** @deprecated Use status for passive toolbar information. */
  center?: ReactNode
  end?: ReactNode
  children?: ReactNode
  className?: string
}
