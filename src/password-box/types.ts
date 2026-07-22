import type { InputHTMLAttributes, ReactNode } from 'react'
export interface AppPasswordBoxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> { invalid?: boolean; size?: 'compact' | 'standard'; revealable?: boolean; strength?: ReactNode }
