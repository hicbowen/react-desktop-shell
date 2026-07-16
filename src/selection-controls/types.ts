import type { InputHTMLAttributes, ReactNode } from 'react'
type NativeCheckProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'checked' | 'defaultChecked' | 'onChange' | 'size'>
export interface AppCheckBoxProps extends NativeCheckProps { checked?: boolean; defaultChecked?: boolean; onCheckedChange?: (checked: boolean) => void; indeterminate?: boolean; label?: ReactNode; description?: ReactNode }
export interface AppToggleSwitchProps extends NativeCheckProps { checked?: boolean; defaultChecked?: boolean; onCheckedChange?: (checked: boolean) => void; label?: ReactNode; description?: ReactNode; labelPosition?: 'start' | 'end'; size?: 'compact' | 'standard' }
