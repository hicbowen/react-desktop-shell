import type { CSSProperties } from 'react'

export interface AppTimeValue {
  hour: number
  minute: number
}

export interface AppTimeRangeValue {
  start: AppTimeValue
  end: AppTimeValue
}

export interface AppTimePickerProps {
  value?: AppTimeValue | null
  defaultValue?: AppTimeValue | null
  onValueChange?: (value: AppTimeValue | null) => void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  minValue?: AppTimeValue
  maxValue?: AppTimeValue
  minuteStep?: number
  allowClear?: boolean
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  invalid?: boolean
  name?: string
  id?: string
  className?: string
  style?: CSSProperties
}

export interface AppTimeRangePickerProps {
  value?: AppTimeRangeValue | null
  defaultValue?: AppTimeRangeValue | null
  onValueChange?: (value: AppTimeRangeValue | null) => void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  minValue?: AppTimeValue
  maxValue?: AppTimeValue
  minuteStep?: number
  minDuration?: number
  maxDuration?: number
  allowClear?: boolean
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  invalid?: boolean
  startName?: string
  endName?: string
  id?: string
  className?: string
  style?: CSSProperties
}
