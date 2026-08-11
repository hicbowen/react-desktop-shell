import type { CSSProperties, ReactNode } from 'react'

export interface AppCarouselSlide {
  key: string
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  visual?: ReactNode
}

export interface AppCarouselProps {
  slides: readonly AppCarouselSlide[]
  value?: string
  defaultValue?: string
  onValueChange?: (key: string) => void
  ariaLabel?: string
  className?: string
  style?: CSSProperties
}
