import type { CSSProperties, ReactNode } from 'react'

export type AppDockPosition = 'left' | 'right' | 'bottom'

export interface AppDockPanel {
  key: string
  title: ReactNode
  content: ReactNode
  position: AppDockPosition
  icon?: ReactNode
  minimizable?: boolean
  defaultSize?: number
  minSize?: number
  maxSize?: number
}

export interface AppDockLayoutState {
  sizes: Partial<Record<AppDockPosition, number>>
  activePanelKeys: Partial<Record<AppDockPosition, string>>
  minimizedPanelKeys: string[]
}

export interface AppDockWorkspaceProps {
  panels: readonly AppDockPanel[]
  children: ReactNode
  layout?: AppDockLayoutState
  defaultLayout?: Partial<AppDockLayoutState>
  onLayoutChange?: (layout: AppDockLayoutState) => void
  /** Saves uncontrolled and controlled layout updates as versioned JSON. */
  persistenceKey?: string
  storage?: Pick<Storage, 'getItem' | 'setItem'>
  ariaLabel?: string
  className?: string
  style?: CSSProperties
}
