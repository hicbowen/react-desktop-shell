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
} satisfies AppLocaleMessages
