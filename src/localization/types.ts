export type AppLocale = 'system' | 'zh-CN' | 'en-US'

export type ResolvedAppLocale = 'zh-CN' | 'en-US'

export interface AppLocaleMessages {
  common: {
    apply: string
    cancel: string
    close: string
    confirm: string
    dismiss: string
    loading: string
    required: string
  }
  shell: {
    openNavigation: string
    closeNavigation: string
    expandNavigation: string
    collapseNavigation: string
    primaryNavigation: string
  }
  window: {
    minimize: string
    maximize: string
    restore: string
    close: string
  }
  sidePane: {
    resize: string
    close: string
  }
  contextMenu: {
    undo: string
    cut: string
    copy: string
    paste: string
    delete: string
    selectAll: string
  }
  dataTable: {
    searchPlaceholder: string
    searchAriaLabel: string
    clearSearch: string
    filters: string
    activeFilters: (count: number) => string
    unnamedFilter: (index: number) => string
    clearFilter: string
    clearFilterAriaLabel: (label: string) => string
    clearFilters: string
    clearAll: string
    clearAllAriaLabel: string
    rowsPerPage: string
    range: (start: number, end: number, total: number) => string
    page: (page: number, pageCount: number) => string
    firstPage: string
    previousPage: string
    nextPage: string
    lastPage: string
    loading: string
    empty: string
    selectAllRows: string
    selectAllPageRows: string
    selectAllFilteredRows: string
    selectRow: (id: string) => string
    selectedCount: (count: number) => string
    clearSelection: string
  }
  textBox: {
    clear: string
    loading: string
  }
  numberBox: {
    increase: string
    decrease: string
  }
  teachingTip: {
    label: string
    close: string
  }
  infoBar: {
    dismiss: string
  }
  splitButton: {
    openMore: string
  }
  fileDrop: {
    title: string
    rejectTitle: string
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
