import type { ReactNode } from 'react'

export type AppToolbarAppearance = 'surface' | 'flat'

export interface AppToolbarProps {
  appearance?: AppToolbarAppearance
  start?: ReactNode
  status?: ReactNode
  end?: ReactNode
  children?: ReactNode
  className?: string
}
