import type { CSSProperties, ReactNode } from 'react'
export interface AppResizablePaneGroupProps { children: [ReactNode, ReactNode]; orientation?: 'horizontal' | 'vertical'; size?: number; defaultSize?: number; minSize?: number; maxSize?: number; onSizeChange?: (size: number) => void; resizeLabel?: string; disabled?: boolean; className?: string; style?: CSSProperties }
