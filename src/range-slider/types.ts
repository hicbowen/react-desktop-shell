import type { CSSProperties } from 'react'
export type AppRangeSliderValue = readonly [number, number]
export interface AppRangeSliderProps { value?: AppRangeSliderValue; defaultValue?: AppRangeSliderValue; onValueChange?: (value: [number, number]) => void; min?: number; max?: number; step?: number; minDistance?: number; disabled?: boolean; startLabel?: string; endLabel?: string; className?: string; style?: CSSProperties }
