export type AppLocale = 'system' | 'zh-CN' | 'en-US'

export type ResolvedAppLocale = 'zh-CN' | 'en-US'

export interface AppLocaleMessages {
  common: {
    apply: string
    cancel: string
    close: string
  }
  datePicker: {
    placeholder: string
    openLabel: string
    clearLabel: string
    previousMonthLabel: string
    nextMonthLabel: string
    dialogLabel: string
  }
  dateRangePicker: {
    startPlaceholder: string
    endPlaceholder: string
    openLabel: string
    clearLabel: string
    dialogLabel: string
    selectedDays: (days: number) => string
    invalidRange: string
  }
  timePicker: {
    placeholder: string
    openLabel: string
    clearLabel: string
    dialogLabel: string
    hourLabel: string
    minuteLabel: string
    noAvailableTime: string
  }
  timeRangePicker: {
    startLabel: string
    endLabel: string
    startPlaceholder: string
    endPlaceholder: string
    openLabel: string
    clearLabel: string
    dialogLabel: string
    duration: (minutes: number) => string
    invalidRange: string
    durationTooShort: (minutes: number) => string
    durationTooLong: (minutes: number) => string
  }
}

export interface AppLocaleContextValue {
  locale: ResolvedAppLocale
  messages: AppLocaleMessages
  firstDayOfWeek: 0 | 1
  hourCycle: 12 | 24
}
