export type AppLocale = "system" | "zh-CN" | "en-US";

export type ResolvedAppLocale = "zh-CN" | "en-US";

export interface AppLocaleMessages {
  common: {
    apply: string;
    cancel: string;
    close: string;
    confirm: string;
    dismiss: string;
    loading: string;
    required: string;
  };
  shell: {
    openNavigation: string;
    closeNavigation: string;
    expandNavigation: string;
    collapseNavigation: string;
    primaryNavigation: string;
  };
  window: {
    minimize: string;
    maximize: string;
    restore: string;
    close: string;
  };
  sidePane: {
    resize: string;
    close: string;
  };
  breadcrumbBar: {
    label: string;
    showEarlierLocations: string;
  };
  menuBar: {
    label: string;
  };
  statusBar: {
    label: string;
  };
  commandPalette: {
    label: string;
    empty: string;
    placeholder: string;
  };
  ai: {
    label: string;
    inputLabel: string;
    placeholder: string;
    composerToolbar: string;
    send: string;
    stop: string;
    thinking: string;
    responding: string;
    awaitingApproval: string;
    awaitingReview: string;
    canceled: string;
    response: string;
    failed: string;
    error: string;
    suggestions: string;
    searching: string;
    usingTool: string;
    approvalRequired: string;
    approveOnce: string;
    reject: string;
    rejected: string;
    running: string;
    completed: string;
    toolFailed: string;
    cancelTool: string;
    showToolDetails: string;
    hideToolDetails: string;
    toolActivity: string;
    toolProgress: (completed: number, total: number) => string;
    toolProgressWithFailures: (
      completed: number,
      total: number,
      failed: number,
    ) => string;
    toolProgressWithCancellations: (
      completed: number,
      total: number,
      canceled: number,
    ) => string;
    toolProgressWithIssues: (
      completed: number,
      total: number,
      failed: number,
      canceled: number,
    ) => string;
    toolApprovalCount: (count: number) => string;
    toolFailureCount: (count: number) => string;
    toolCompletedCount: (count: number) => string;
    expandToolActivity: string;
    collapseToolActivity: string;
    noToolActivity: string;
    messageActions: string;
    copyResponse: string;
    retryResponse: string;
    editMessage: string;
    helpful: string;
    notHelpful: string;
    copyCode: string;
    codeCopied: string;
    codeCopyFailed: string;
    code: string;
  };
  conversation: {
    label: string;
    user: string;
    assistant: string;
    tool: string;
    system: string;
    jumpToLatest: string;
    loadEarlier: string;
    loadingEarlier: string;
  };
  changeReview: {
    label: string;
    pending: string;
    applying: string;
    applied: string;
    rejected: string;
    failed: string;
    apply: string;
    reject: string;
    showDetails: string;
    hideDetails: string;
    noChanges: string;
  };
  autoComplete: {
    empty: string;
    loading: string;
  };
  propertyGrid: {
    label: string;
    modified: string;
    resetProperty: (label?: string) => string;
    resizeNameColumn: (label?: string) => string;
  };
  resizablePane: {
    resize: string;
  };
  treeView: {
    label: string;
    expand: string;
    collapse: string;
  };
  tabView: {
    label: string;
    newTab: string;
    unsaved: string;
    allTabs: string;
  };
  wizard: {
    steps: string;
    step: (current: number, total: number) => string;
    optional: string;
    back: string;
    next: string;
    finish: string;
  };
  carousel: {
    label: string;
    previous: string;
    next: string;
    position: (current: number, total: number) => string;
  };
  contextMenu: {
    undo: string;
    cut: string;
    copy: string;
    paste: string;
    delete: string;
    selectAll: string;
  };
  dataTable: {
    searchPlaceholder: string;
    searchAriaLabel: string;
    clearSearch: string;
    filterColumn: (columnId: string) => string;
    searchOptions: string;
    selectAllOptions: string;
    noMatchingOptions: string;
    applyFilter: string;
    cancelFilter: string;
    filters: string;
    activeFilters: (count: number) => string;
    unnamedFilter: (index: number) => string;
    clearFilter: string;
    clearFilterAriaLabel: (label: string) => string;
    clearFilters: string;
    clearAll: string;
    clearAllAriaLabel: string;
    rowsPerPage: string;
    range: (start: number, end: number, total: number) => string;
    page: (page: number, pageCount: number) => string;
    firstPage: string;
    previousPage: string;
    nextPage: string;
    lastPage: string;
    loading: string;
    empty: string;
    selectAllRows: string;
    selectAllPageRows: string;
    selectAllFilteredRows: string;
    selectRow: (id: string) => string;
    selectedCount: (count: number) => string;
    clearSelection: string;
    columnActions: (columnId: string) => string;
    sortAscending: string;
    sortDescending: string;
    clearSorting: string;
    clearColumnFilter: string;
    stickyColumn: (columnId: string) => string;
    pinnedColumn: (columnId: string) => string;
  };
  pagination: {
    label: string;
    itemsPerPage: string;
    range: (start: number, end: number, total: number) => string;
    page: (page: number, pageCount: number) => string;
    firstPage: string;
    previousPage: string;
    nextPage: string;
    lastPage: string;
  };
  skeleton: {
    loading: string;
  };
  searchBox: {
    label: string;
    placeholder: string;
  };
  colorPicker: {
    label: string;
    saturationValue: string;
    hue: string;
    hex: string;
    presets: string;
    clear: string;
    noColor: string;
  };
  filePicker: {
    chooseFile: string;
    chooseFiles: string;
    dropHint: string;
    browse: string;
    selectedFiles: string;
    remove: (name: string) => string;
  };
  toolbar: {
    moreActions: string;
  };
  multiSelect: {
    label: string;
    placeholder: string;
    empty: string;
    remove: (label: string) => string;
  };
  passwordBox: { show: string; hide: string; capsLock: string };
  rangeSlider: { start: string; end: string };
  validationSummary: { label: string; title: string };
  shortcutRecorder: {
    label: string;
    placeholder: string;
    recording: string;
    clear: string;
  };
  loadingOverlay: { label: string; cancel: string };
  textBox: {
    clear: string;
    loading: string;
  };
  numberBox: {
    increase: string;
    decrease: string;
    openActions: string;
  };
  select: {
    clear: string;
  };
  statusBadge: {
    neutral: string;
    info: string;
    success: string;
    warning: string;
    danger: string;
  };
  tag: {
    dismiss: string;
  };
  cascader: {
    placeholder: string;
    clear: string;
    empty: string;
  };
  teachingTip: {
    label: string;
    close: string;
  };
  infoBar: {
    dismiss: string;
  };
  splitButton: {
    openMore: string;
  };
  fileDrop: {
    title: string;
    rejectTitle: string;
  };
  datePicker: {
    placeholder: string;
    openLabel: string;
    clearLabel: string;
    previousMonthLabel: string;
    nextMonthLabel: string;
    dialogLabel: string;
  };
  dateRangePicker: {
    startPlaceholder: string;
    endPlaceholder: string;
    openLabel: string;
    clearLabel: string;
    dialogLabel: string;
    selectedDays: (days: number) => string;
    invalidRange: string;
  };
  timePicker: {
    placeholder: string;
    openLabel: string;
    clearLabel: string;
    dialogLabel: string;
    hourLabel: string;
    minuteLabel: string;
    noAvailableTime: string;
  };
  timeRangePicker: {
    startLabel: string;
    endLabel: string;
    startPlaceholder: string;
    endPlaceholder: string;
    openLabel: string;
    clearLabel: string;
    dialogLabel: string;
    duration: (minutes: number) => string;
    invalidRange: string;
    durationTooShort: (minutes: number) => string;
    durationTooLong: (minutes: number) => string;
  };
  taskCenter: {
    label: string;
    activeTasks: (count: number) => string;
    cancel: string;
    retry: string;
    dismiss: string;
    empty: string;
    queued: string;
    running: string;
    paused: string;
    success: string;
    error: string;
    canceled: string;
  };
  copyableText: {
    copy: string;
    copied: string;
    failed: string;
  };
  inlineEdit: {
    edit: string;
    save: string;
    cancel: string;
    required: string;
    saveFailed: string;
  };
  notificationCenter: {
    label: string;
    unread: (count: number) => string;
    markRead: string;
    markUnread: string;
    markAllRead: string;
    dismiss: string;
    clearAll: string;
    empty: string;
  };
  avatar: {
    available: string;
    away: string;
    busy: string;
    offline: string;
    unknown: string;
  };
}

export interface AppLocaleContextValue {
  locale: ResolvedAppLocale;
  messages: AppLocaleMessages;
  firstDayOfWeek: 0 | 1;
  hourCycle: 12 | 24;
}
