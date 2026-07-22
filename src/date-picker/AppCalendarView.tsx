import { useState } from 'react'
import { AppCalendar as AppCalendarSurface } from './AppCalendar'
import { getTodayAppDate, startOfMonth } from './dateMath'
import { useAppLocale } from '../localization/useAppLocale'
import type { AppCalendarProps } from './types'

export function AppCalendar({
  value,
  defaultValue = null,
  onValueChange,
  displayedMonth,
  defaultDisplayedMonth,
  onDisplayedMonthChange,
  minValue,
  maxValue,
  isDateUnavailable,
  showOutsideDays = true,
  visibleMonths = 1,
  disabled = false,
  ariaLabel,
  className,
  style,
}: AppCalendarProps) {
  const { messages } = useAppLocale()
  const controlled = value !== undefined
  const initialDate = value ?? defaultValue ?? getTodayAppDate()
  const [internalValue, setInternalValue] = useState(defaultValue)
  const selectedDate = value ?? internalValue
  const [internalMonth, setInternalMonth] = useState(() => startOfMonth(defaultDisplayedMonth ?? initialDate))
  const currentMonth = startOfMonth(displayedMonth ?? internalMonth)
  const [focusedDate, setFocusedDate] = useState(initialDate)

  const setMonth = (next: typeof currentMonth) => {
    if (displayedMonth === undefined) setInternalMonth(next)
    onDisplayedMonthChange?.(next)
  }
  const select = (next: typeof focusedDate) => {
    if (!controlled) setInternalValue(next)
    onValueChange?.(next)
  }

  return <div className={className} style={style}><AppCalendarSurface
    dialogLabel={ariaLabel ?? messages.datePicker.dialogLabel}
    displayedMonth={currentMonth}
    focusedDate={focusedDate}
    isDateUnavailable={isDateUnavailable}
    maxValue={maxValue}
    minValue={minValue}
    onDateSelect={select}
    onDisplayedMonthChange={setMonth}
    onFocusedDateChange={setFocusedDate}
    role="group"
    selectedDate={selectedDate}
    selectionDisabled={disabled}
    showOutsideDays={showOutsideDays}
    visibleMonths={visibleMonths}
  /></div>
}
