import type { InputHTMLAttributes, ReactNode } from 'react'

export interface AppAutoCompleteOption {
  value: string
  label?: ReactNode
  disabled?: boolean
}

export interface AppAutoCompleteProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'defaultValue' | 'list' | 'onChange' | 'size' | 'value'
> {
  options: AppAutoCompleteOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  onOptionSelect?: (option: AppAutoCompleteOption) => void
  filterOption?: false | ((input: string, option: AppAutoCompleteOption) => boolean)
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  clearable?: boolean
  loading?: boolean
  emptyContent?: ReactNode
  invalid?: boolean
  size?: 'compact' | 'standard'
}
