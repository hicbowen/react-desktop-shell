import type { CSSProperties, ReactNode } from 'react'

export interface AppMultiSelectOption { value: string; label: ReactNode; disabled?: boolean }
export interface AppMultiSelectProps {
  options: readonly AppMultiSelectOption[]
  value?: readonly string[]
  defaultValue?: readonly string[]
  onValueChange?: (value: string[]) => void
  maxSelected?: number
  searchable?: boolean
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  invalid?: boolean
  className?: string
  style?: CSSProperties
}
export type AppTagPickerProps = AppMultiSelectProps
