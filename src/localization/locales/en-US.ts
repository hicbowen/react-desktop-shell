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
    confirm: 'Confirm',
    dismiss: 'Dismiss',
    loading: 'Loading',
    required: 'Required',
  },
  shell: {
    openNavigation: 'Open navigation',
    closeNavigation: 'Close navigation',
    expandNavigation: 'Expand navigation',
    collapseNavigation: 'Collapse navigation',
    primaryNavigation: 'Primary',
  },
  window: {
    minimize: 'Minimize window',
    maximize: 'Maximize window',
    restore: 'Restore window',
    close: 'Close window',
  },
  sidePane: {
    resize: 'Resize side pane',
    close: 'Close side pane',
  },
  breadcrumbBar: {
    label: 'Breadcrumb',
    showEarlierLocations: 'Show earlier locations',
  },
  menuBar: { label: 'Application menu' },
  statusBar: { label: 'Status' },
  commandPalette: {
    label: 'Command palette',
    empty: 'No matching commands',
    placeholder: 'Type a command',
  },
  autoComplete: {
    empty: 'No suggestions',
    loading: 'Loading suggestions…',
  },
  propertyGrid: {
    label: 'Properties',
    modified: 'Modified',
    resetProperty: (label?: string) =>
      `Reset to default${label ? ` ${label}` : ''}`,
    resizeNameColumn: (label?: string) =>
      `Resize property name column${label ? ` ${label}` : ''}`,
  },
  resizablePane: { resize: 'Resize panes' },
  treeView: {
    label: 'Tree',
    expand: 'Expand',
    collapse: 'Collapse',
  },
  tabView: {
    label: 'Documents',
    newTab: 'New tab',
    unsaved: 'Unsaved',
    allTabs: 'All tabs',
  },
  contextMenu: {
    undo: 'Undo',
    cut: 'Cut',
    copy: 'Copy',
    paste: 'Paste',
    delete: 'Delete',
    selectAll: 'Select all',
  },
  dataTable: {
    searchPlaceholder: 'Search rows',
    searchAriaLabel: 'Search rows',
    clearSearch: 'Clear search',
    filters: 'Filters',
    activeFilters: (count: number) => `Filters, ${count} active`,
    unnamedFilter: (index: number) => `field ${index + 1}`,
    clearFilter: 'Clear',
    clearFilterAriaLabel: (label: string) => `Clear ${label} filter`,
    clearFilters: 'Clear filters',
    clearAll: 'Clear all',
    clearAllAriaLabel: 'Clear all search and filters',
    rowsPerPage: 'Rows per page',
    range: (start: number, end: number, total: number) =>
      `${start}–${end} of ${total}`,
    page: (page: number, pageCount: number) =>
      `Page ${page} of ${pageCount}`,
    firstPage: 'First page',
    previousPage: 'Previous page',
    nextPage: 'Next page',
    lastPage: 'Last page',
    loading: 'Loading…',
    empty: 'No data',
    selectAllRows: 'Select all rows',
    selectAllPageRows: 'Select all rows on this page',
    selectAllFilteredRows: 'Select all filtered rows',
    selectRow: (id: string) => `Select row ${id}`,
    selectedCount: (count: number) => `${count} selected`,
    clearSelection: 'Clear selection',
  },
  pagination: {
    label: 'Pagination',
    itemsPerPage: 'Items per page',
    range: (start: number, end: number, total: number) => `${start}–${end} of ${total}`,
    page: (page: number, pageCount: number) => `Page ${page} of ${pageCount}`,
    firstPage: 'First page',
    previousPage: 'Previous page',
    nextPage: 'Next page',
    lastPage: 'Last page',
  },
  skeleton: {
    loading: 'Loading content',
  },
  searchBox: {
    label: 'Search',
    placeholder: 'Search',
  },
  colorPicker: {
    label: 'Choose color',
    saturationValue: 'Saturation and brightness',
    hue: 'Hue',
    hex: 'Hex color',
    presets: 'Preset colors',
    clear: 'Clear color',
    noColor: 'No color',
  },
  filePicker: {
    chooseFile: 'Choose a file',
    chooseFiles: 'Choose files',
    dropHint: 'Drop files here or browse from your device.',
    browse: 'Browse',
    selectedFiles: 'Selected files',
    remove: (name: string) => `Remove ${name}`,
  },
  toolbar: {
    moreActions: 'More actions',
  },
  multiSelect: {
    label: 'Select options',
    placeholder: 'Select options',
    empty: 'No options',
    remove: (label: string) => `Remove ${label}`,
  },
  passwordBox: { show: 'Show password', hide: 'Hide password', capsLock: 'Caps Lock is on' },
  rangeSlider: { start: 'Minimum value', end: 'Maximum value' },
  validationSummary: { label: 'Validation errors', title: 'Correct the following errors' },
  shortcutRecorder: { label: 'Keyboard shortcut', placeholder: 'Record shortcut', recording: 'Press shortcut', clear: 'Clear shortcut' },
  loadingOverlay: { label: 'Loading', cancel: 'Cancel' },
  textBox: {
    clear: 'Clear input',
    loading: 'Loading',
  },
  numberBox: {
    increase: 'Increase value',
    decrease: 'Decrease value',
  },
  statusBadge: {
    neutral: 'Neutral',
    info: 'Information',
    success: 'Success',
    warning: 'Warning',
    danger: 'Danger',
  },
  tag: {
    dismiss: 'Remove tag',
  },
  cascader: {
    placeholder: 'Select an option',
    clear: 'Clear selection',
    empty: 'No options',
  },
  teachingTip: {
    label: 'Teaching tip',
    close: 'Close',
  },
  infoBar: {
    dismiss: 'Dismiss',
  },
  splitButton: {
    openMore: 'Open more options',
  },
  fileDrop: {
    title: 'Drop files to import',
    rejectTitle: 'These files are not supported',
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
  taskCenter: {
    label: 'Background tasks', activeTasks: (count: number) => `${count} active tasks`, cancel: 'Cancel task', retry: 'Retry task',
    dismiss: 'Dismiss task', empty: 'No background tasks', queued: 'Queued',
    running: 'Running', paused: 'Paused', success: 'Completed', error: 'Failed',
    canceled: 'Canceled',
  },
  copyableText: { copy: 'Copy', copied: 'Copied' },
  inlineEdit: { edit: 'Edit value', save: 'Save', cancel: 'Cancel', required: 'Enter a value', saveFailed: 'Could not save changes' },
  notificationCenter: { label: 'Notifications', unread: (count: number) => `${count} unread notifications`, markRead: 'Mark as read', markUnread: 'Mark as unread', markAllRead: 'Mark all as read', dismiss: 'Dismiss notification', clearAll: 'Clear all', empty: 'No notifications' },
} satisfies AppLocaleMessages
