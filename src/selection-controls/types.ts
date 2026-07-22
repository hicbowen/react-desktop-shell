import type { CSSProperties, InputHTMLAttributes, ReactNode } from 'react'
type NativeCheckProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'checked' | 'defaultChecked' | 'onChange' | 'size'>
export interface AppCheckBoxProps extends NativeCheckProps { checked?: boolean; defaultChecked?: boolean; onCheckedChange?: (checked: boolean) => void; indeterminate?: boolean; label?: ReactNode; description?: ReactNode }
export interface AppToggleSwitchProps extends NativeCheckProps { checked?: boolean; defaultChecked?: boolean; onCheckedChange?: (checked: boolean) => void; label?: ReactNode; description?: ReactNode; labelPosition?: 'start' | 'end'; size?: 'compact' | 'standard' }

export interface AppRadioGroupOption {
  value: string
  label: ReactNode
  description?: ReactNode
  disabled?: boolean
}

export interface AppRadioGroupProps {
  options: readonly AppRadioGroupOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  label?: ReactNode
  description?: ReactNode
  name?: string
  form?: string
  required?: boolean
  disabled?: boolean
  orientation?: 'horizontal' | 'vertical'
  ariaLabel?: string
  className?: string
  style?: CSSProperties
}

export interface AppSegmentedControlOption {
  value: string
  label: ReactNode
  icon?: ReactNode
  disabled?: boolean
  ariaLabel?: string
}

export interface AppSegmentedControlProps {
  options: readonly AppSegmentedControlOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  name?: string
  form?: string
  required?: boolean
  disabled?: boolean
  size?: 'compact' | 'standard'
  fullWidth?: boolean
  ariaLabel?: string
  className?: string
  style?: CSSProperties
}
