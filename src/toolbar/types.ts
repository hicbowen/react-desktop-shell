import type { ReactNode } from 'react'

export interface AppToolbarProps {
  start?: ReactNode
  status?: ReactNode
  end?: ReactNode
  children?: ReactNode
  className?: string
}
