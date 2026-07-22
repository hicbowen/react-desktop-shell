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
  breadcrumbBar: {
    label: string
    showEarlierLocations: string
  }
  menuBar: {
    label: string
  }
  statusBar: {
    label: string
  }
  commandPalette: {
    label: string
    empty: string
    placeholder: string
  }
  autoComplete: {
    empty: string
    loading: string
  }
  propertyGrid: {
    label: string
    modified: string
    resetProperty: (label?: string) => string
    resizeNameColumn: (label?: string) => string
  }
  resizablePane: {
    resize: string
  }
  treeView: {
    label: string
    expand: string
    collapse: string
  }
  tabView: {
    label: string
    newTab: string
    unsaved: string
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
  pagination: {
    label: string
    itemsPerPage: string
    range: (start: number, end: number, total: number) => string
    page: (page: number, pageCount: number) => string
    firstPage: string
    previousPage: string
    nextPage: string
    lastPage: string
  }
  skeleton: {
    loading: string
  }
  textBox: {
    clear: string
    loading: string
  }
  numberBox: {
    increase: string
    decrease: string
  }
  statusBadge: {
    neutral: string
    info: string
    success: string
    warning: string
    danger: string
  }
  tag: {
    dismiss: string
  }
  cascader: {
    placeholder: string
    clear: string
    empty: string
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
  taskCenter: {
    label: string
    activeTasks: (count: number) => string
    cancel: string
    retry: string
    dismiss: string
    empty: string
    queued: string
    running: string
    paused: string
    success: string
    error: string
    canceled: string
  }
}

export interface AppLocaleContextValue {
  locale: ResolvedAppLocale
  messages: AppLocaleMessages
  firstDayOfWeek: 0 | 1
  hourCycle: 12 | 24
}
