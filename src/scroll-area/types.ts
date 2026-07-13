import type { HTMLAttributes } from 'react'

export type AppScrollAreaOrientation = 'vertical' | 'horizontal' | 'both'
export type AppScrollAreaScrollbar = 'auto' | 'always' | 'hidden'
export type AppScrollAreaGutter = 'auto' | 'stable'

export interface AppScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: AppScrollAreaOrientation
  scrollbar?: AppScrollAreaScrollbar
  gutter?: AppScrollAreaGutter
}
