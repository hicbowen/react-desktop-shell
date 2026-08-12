import type { CSSProperties, ReactNode } from 'react'

export type AppCarouselLayout = 'split' | 'media' | 'stacked'

export interface AppCarouselSlide {
  key: string
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  visual?: ReactNode
  visualAriaLabel?: string
}

export interface AppCarouselProps {
  slides: readonly AppCarouselSlide[]
  layout?: AppCarouselLayout
  value?: string
  defaultValue?: string
  onValueChange?: (key: string) => void
  ariaLabel?: string
  className?: string
  style?: CSSProperties
}
