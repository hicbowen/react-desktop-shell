import type { AppLocaleMessages } from '../types'

function formatEnglishUnit(value: number, unit: string) {
  return `${value} ${unit}${value === 1 ? '' : 's'}`
}

function formatEnglishDuration(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const remaining = minutes % 60
  const parts = []

  if (hours > 0) parts.push(formatEnglishUnit(hours, 'hour'))
  if (remaining > 0 || hours === 0) {
    parts.push(formatEnglishUnit(remaining, 'minute'))
  }
  return parts.join(' ')
}

export const enUSMessages = {
  common: {
    apply: 'Apply',
    cancel: 'Cancel',
    close: 'Close',
  },
  datePicker: {
    placeholder: 'Select a date',
    openLabel: 'Open date picker',
    clearLabel: 'Clear date',
    previousMonthLabel: 'Previous month',
    nextMonthLabel: 'Next month',
    dialogLabel: 'Date picker',
  },
  dateRangePicker: {
    startPlaceholder: 'Start date',
    endPlaceholder: 'End date',
    openLabel: 'Open date range picker',
    clearLabel: 'Clear date range',
    dialogLabel: 'Date range picker',
    selectedDays: (days: number) => `${days} selected days`,
    invalidRange: 'Select a valid date range',
  },
  timePicker: {
    placeholder: 'Select a time',
    openLabel: 'Open time picker',
    clearLabel: 'Clear time',
    dialogLabel: 'Time picker',
    hourLabel: 'Hour',
    minuteLabel: 'Minute',
    noAvailableTime: 'No available times',
  },
  timeRangePicker: {
    startLabel: 'Start time',
    endLabel: 'End time',
    startPlaceholder: 'Start time',
    endPlaceholder: 'End time',
    openLabel: 'Open time range picker',
    clearLabel: 'Clear time range',
    dialogLabel: 'Time range picker',
    duration: formatEnglishDuration,
    invalidRange: 'End time must be later than start time',
    durationTooShort: (minutes: number) =>
      `Time range must be at least ${formatEnglishDuration(minutes)}`,
    durationTooLong: (minutes: number) =>
      `Time range must not exceed ${formatEnglishDuration(minutes)}`,
  },
} satisfies AppLocaleMessages
