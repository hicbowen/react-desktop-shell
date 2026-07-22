import type { AppTextBoxProps } from '../text-input'

export interface AppSearchBoxProps extends Omit<AppTextBoxProps, 'type' | 'startIcon' | 'clearable' | 'onClear' | 'onChange' | 'value' | 'defaultValue'> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  onSearch?: (value: string) => void
  debounceMs?: number
  clearOnEscape?: boolean
}
