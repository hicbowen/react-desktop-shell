import type { CSSProperties } from 'react'

export interface AppTimeValue {
  hour: number
  minute: number
}

export interface AppTimeRangeValue {
  start: AppTimeValue
  end: AppTimeValue
}

export interface AppTimePickerLocale {
  timeButtonLabel: string
  clearButtonLabel: string
  hourLabel: string
  minuteLabel: string
  cancelLabel: string
  applyLabel: string
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
  hourCycle?: 12 | 24
  locale?: string
  placeholder?: string
  allowClear?: boolean
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  invalid?: boolean
  name?: string
  id?: string
  className?: string
  style?: CSSProperties
  localeText?: Partial<AppTimePickerLocale>
}

export interface AppTimeRangePickerLocale extends AppTimePickerLocale {
  dialogLabel: string
  startLabel: string
  endLabel: string
  startPlaceholder: string
  endPlaceholder: string
  durationLabel: (minutes: number) => string
  invalidRangeLabel: string
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
  hourCycle?: 12 | 24
  locale?: string
  startPlaceholder?: string
  endPlaceholder?: string
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
  localeText?: Partial<AppTimeRangePickerLocale>
}
