import type { CSSProperties, InputHTMLAttributes, ReactNode } from 'react'

export interface AppSliderMark {
  value: number
  label?: ReactNode
}

export interface AppSliderProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'defaultValue' | 'onChange' | 'orient' | 'size' | 'type' | 'value'
> {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
  orientation?: 'horizontal' | 'vertical'
  size?: 'compact' | 'standard'
  marks?: AppSliderMark[]
  showValue?: boolean
  formatValue?: (value: number) => ReactNode
  invalid?: boolean
  className?: string
  style?: CSSProperties
}
