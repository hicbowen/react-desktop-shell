import type { SelectHTMLAttributes } from 'react'

export interface AppSelectOption {
  value: string
  label: React.ReactNode
  disabled?: boolean
}

export interface AppSelectProps
  extends Omit<
    SelectHTMLAttributes<HTMLSelectElement>,
    'value' | 'defaultValue' | 'size'
  > {
  options: AppSelectOption[]
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
  placeholder?: string
  clearable?: boolean
  invalid?: boolean
  size?: 'compact' | 'standard'
}
