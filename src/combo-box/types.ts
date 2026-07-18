import type { InputHTMLAttributes, ReactNode } from 'react'

export interface AppComboBoxOption {
  value: string
  label: ReactNode
  disabled?: boolean
}

export interface AppComboBoxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'defaultValue' | 'list' | 'onChange' | 'size' | 'value'
> {
  options: AppComboBoxOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  allowCustomValue?: boolean
  clearable?: boolean
  invalid?: boolean
  size?: 'compact' | 'standard'
}
