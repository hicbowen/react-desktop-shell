import type { CSSProperties } from 'react'

export interface AppDateValue {
  year: number
  month: number
  day: number
}

export interface AppDateRangeValue {
  start: AppDateValue
  end: AppDateValue
}

export type AppWeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface AppDatePickerProps {
  value?: AppDateValue | null
  defaultValue?: AppDateValue | null
  onValueChange?: (value: AppDateValue | null) => void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  minValue?: AppDateValue
  maxValue?: AppDateValue
  isDateUnavailable?: (value: AppDateValue) => boolean
  allowClear?: boolean
  showOutsideDays?: boolean
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  invalid?: boolean
  name?: string
  id?: string
  className?: string
  style?: CSSProperties
}

export interface AppDateRangePickerProps {
  value?: AppDateRangeValue | null
  defaultValue?: AppDateRangeValue | null
  onValueChange?: (value: AppDateRangeValue | null) => void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  minValue?: AppDateValue
  maxValue?: AppDateValue
  isDateUnavailable?: (value: AppDateValue) => boolean
  minDuration?: number
  maxDuration?: number
  allowClear?: boolean
  showOutsideDays?: boolean
  visibleMonths?: 1 | 2 | 'responsive'
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
