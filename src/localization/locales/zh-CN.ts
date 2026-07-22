import type { AppLocaleMessages } from '../types'

function formatChineseDuration(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const remaining = minutes % 60

  if (hours > 0 && remaining > 0) {
    return `${hours} 小时 ${remaining} 分钟`
  }
  if (hours > 0) return `${hours} 小时`
  return `${remaining} 分钟`
}

export const zhCNMessages = {
  common: {
    apply: '应用',
    cancel: '取消',
    close: '关闭',
    confirm: '确认',
    dismiss: '关闭',
    loading: '正在加载',
    required: '必填',
  },
  shell: {
    openNavigation: '打开导航',
    closeNavigation: '关闭导航',
    expandNavigation: '展开导航',
    collapseNavigation: '折叠导航',
    primaryNavigation: '主导航',
  },
  window: {
    minimize: '最小化窗口',
    maximize: '最大化窗口',
    restore: '还原窗口',
    close: '关闭窗口',
  },
  sidePane: {
    resize: '调整侧边窗格大小',
    close: '关闭侧边窗格',
  },
  breadcrumbBar: {
    label: '面包屑导航',
    showEarlierLocations: '显示更早的位置',
  },
  menuBar: { label: '应用程序菜单' },
  statusBar: { label: '状态' },
  commandPalette: {
    label: '命令面板',
    empty: '没有匹配的命令',
    placeholder: '输入命令',
  },
  autoComplete: {
    empty: '没有建议',
    loading: '正在加载建议…',
  },
  propertyGrid: {
    label: '属性',
    modified: '已修改',
    resetProperty: (label?: string) =>
      `重置为默认值${label ? `：${label}` : ''}`,
    resizeNameColumn: (label?: string) =>
      `调整属性名称列大小${label ? `：${label}` : ''}`,
  },
  resizablePane: { resize: '调整窗格大小' },
  treeView: {
    label: '树视图',
    expand: '展开',
    collapse: '折叠',
  },
  tabView: {
    label: '文档',
    newTab: '新建标签页',
    unsaved: '未保存',
  },
  contextMenu: {
    undo: '撤销',
    cut: '剪切',
    copy: '复制',
    paste: '粘贴',
    delete: '删除',
    selectAll: '全选',
  },
  dataTable: {
    searchPlaceholder: '搜索行',
    searchAriaLabel: '搜索行',
    clearSearch: '清除搜索',
    filters: '筛选',
    activeFilters: (count: number) => `筛选，已启用 ${count} 项`,
    unnamedFilter: (index: number) => `字段 ${index + 1}`,
    clearFilter: '清除',
    clearFilterAriaLabel: (label: string) => `清除${label}筛选`,
    clearFilters: '清除筛选',
    clearAll: '全部清除',
    clearAllAriaLabel: '清除搜索和所有筛选',
    rowsPerPage: '每页行数',
    range: (start: number, end: number, total: number) =>
      `${start}–${end}，共 ${total} 行`,
    page: (page: number, pageCount: number) =>
      `第 ${page} 页，共 ${pageCount} 页`,
    firstPage: '第一页',
    previousPage: '上一页',
    nextPage: '下一页',
    lastPage: '最后一页',
    loading: '正在加载…',
    empty: '暂无数据',
    selectAllRows: '选择所有行',
    selectAllPageRows: '选择本页所有行',
    selectAllFilteredRows: '选择所有筛选结果',
    selectRow: (id: string) => `选择行 ${id}`,
    selectedCount: (count: number) => `已选择 ${count} 项`,
    clearSelection: '清除选择',
  },
  pagination: {
    label: '分页导航',
    itemsPerPage: '每页数量',
    range: (start: number, end: number, total: number) => `${start}–${end}，共 ${total} 项`,
    page: (page: number, pageCount: number) => `第 ${page} 页，共 ${pageCount} 页`,
    firstPage: '第一页',
    previousPage: '上一页',
    nextPage: '下一页',
    lastPage: '最后一页',
  },
  textBox: {
    clear: '清除输入',
    loading: '正在加载',
  },
  numberBox: {
    increase: '增加数值',
    decrease: '减少数值',
  },
  statusBadge: {
    neutral: '中性',
    info: '信息',
    success: '成功',
    warning: '警告',
    danger: '危险',
  },
  tag: {
    dismiss: '移除标签',
  },
  cascader: {
    placeholder: '请选择',
    clear: '清除选择',
    empty: '暂无选项',
  },
  teachingTip: {
    label: '教学提示',
    close: '关闭',
  },
  infoBar: {
    dismiss: '关闭',
  },
  splitButton: {
    openMore: '打开更多选项',
  },
  fileDrop: {
    title: '拖放文件以导入',
    rejectTitle: '不支持这些文件',
  },
  datePicker: {
    placeholder: '选择日期',
    openLabel: '打开日期选择器',
    clearLabel: '清除日期',
    previousMonthLabel: '上个月',
    nextMonthLabel: '下个月',
    dialogLabel: '日期选择器',
  },
  dateRangePicker: {
    startPlaceholder: '开始日期',
    endPlaceholder: '结束日期',
    openLabel: '打开日期范围选择器',
    clearLabel: '清除日期范围',
    dialogLabel: '日期范围选择器',
    selectedDays: (days: number) => `已选择 ${days} 天`,
    invalidRange: '请选择有效的日期范围',
  },
  timePicker: {
    placeholder: '选择时间',
    openLabel: '打开时间选择器',
    clearLabel: '清除时间',
    dialogLabel: '时间选择器',
    hourLabel: '小时',
    minuteLabel: '分钟',
    noAvailableTime: '没有可用时间',
  },
  timeRangePicker: {
    startLabel: '开始时间',
    endLabel: '结束时间',
    startPlaceholder: '开始时间',
    endPlaceholder: '结束时间',
    openLabel: '打开时间范围选择器',
    clearLabel: '清除时间范围',
    dialogLabel: '时间范围选择器',
    duration: formatChineseDuration,
    invalidRange: '结束时间必须晚于开始时间',
    durationTooShort: (minutes: number) =>
      `时间范围不能少于 ${minutes} 分钟`,
    durationTooLong: (minutes: number) =>
      `时间范围不能超过 ${minutes} 分钟`,
  },
  taskCenter: {
    label: '后台任务', activeTasks: (count: number) => `${count} 个活动任务`, cancel: '取消任务', retry: '重试任务', dismiss: '清除任务',
    empty: '没有后台任务', queued: '等待中', running: '进行中', paused: '已暂停',
    success: '已完成', error: '失败', canceled: '已取消',
  },
} satisfies AppLocaleMessages
