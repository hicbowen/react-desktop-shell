import type { CSSProperties, ReactNode } from 'react'

export interface AppCascaderOption {
  value: string
  label: ReactNode
  children?: AppCascaderOption[]
  disabled?: boolean
}

export interface AppCascaderProps {
  options: AppCascaderOption[]
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[], options: AppCascaderOption[]) => void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  placeholder?: string
  separator?: ReactNode
  displayRender?: (labels: ReactNode[], options: AppCascaderOption[]) => ReactNode
  clearable?: boolean
  disabled?: boolean
  invalid?: boolean
  required?: boolean
  size?: 'compact' | 'standard'
  emptyContent?: ReactNode
  id?: string
  name?: string
  'aria-label'?: string
  'aria-describedby'?: string
  className?: string
  style?: CSSProperties
}
