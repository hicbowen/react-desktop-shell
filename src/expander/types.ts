import type { CSSProperties, ReactNode } from 'react'
export interface AppExpanderProps { title: ReactNode; description?: ReactNode; icon?: ReactNode; expanded?: boolean; defaultExpanded?: boolean; onExpandedChange?: (expanded: boolean) => void; disabled?: boolean; actions?: ReactNode; appearance?: 'default' | 'subtle'; children: ReactNode; className?: string; style?: CSSProperties }
