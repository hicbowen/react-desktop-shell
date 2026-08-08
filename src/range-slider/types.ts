import type { CSSProperties, ReactNode } from 'react'
export type AppRangeSliderValue = readonly [number, number]
export interface AppRangeSliderProps { value?: AppRangeSliderValue; defaultValue?: AppRangeSliderValue; onValueChange?: (value: [number, number]) => void; min?: number; max?: number; step?: number; minDistance?: number; disabled?: boolean; startLabel?: string; endLabel?: string; showTooltip?: boolean; tooltipDelay?: number; formatValue?: (value: number) => ReactNode; className?: string; style?: CSSProperties }
