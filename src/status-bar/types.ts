import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'
export interface AppStatusBarProps { start?: ReactNode; center?: ReactNode; end?: ReactNode; ariaLabel?: string; className?: string; style?: CSSProperties }
export interface AppStatusBarItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> { children?: ReactNode; icon?: ReactNode; interactive?: boolean }
