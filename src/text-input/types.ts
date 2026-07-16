import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
export interface AppTextBoxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> { startIcon?: React.ReactNode; endIcon?: React.ReactNode; clearable?: boolean; onClear?: () => void; invalid?: boolean; loading?: boolean; size?: 'compact' | 'standard' }
export interface AppTextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> { invalid?: boolean; resize?: 'none' | 'vertical' | 'both'; autoResize?: boolean; minRows?: number; maxRows?: number; showCount?: boolean }
