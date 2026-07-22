import { describe, expect, it } from 'vitest'
import { enUSMessages } from './locales/en-US'
import { zhCNMessages } from './locales/zh-CN'

describe('built-in locale messages', () => {
  it('formats English durations with simple singular and plural forms', () => {
    expect(enUSMessages.timeRangePicker.duration(1)).toBe('1 minute')
    expect(enUSMessages.timeRangePicker.duration(2)).toBe('2 minutes')
    expect(enUSMessages.timeRangePicker.duration(60)).toBe('1 hour')
    expect(enUSMessages.timeRangePicker.duration(120)).toBe('2 hours')
    expect(enUSMessages.timeRangePicker.duration(90)).toBe(
      '1 hour 30 minutes',
    )
  })

  it('formats natural Chinese durations', () => {
    expect(zhCNMessages.timeRangePicker.duration(30)).toBe('30 分钟')
    expect(zhCNMessages.timeRangePicker.duration(60)).toBe('1 小时')
    expect(zhCNMessages.timeRangePicker.duration(90)).toBe(
      '1 小时 30 分钟',
    )
  })

  it('formats localized dynamic component labels', () => {
    expect(enUSMessages.propertyGrid.resizeNameColumn('Name')).toBe(
      'Resize property name column Name',
    )
    expect(zhCNMessages.propertyGrid.resizeNameColumn('名称')).toBe(
      '调整属性名称列大小：名称',
    )
    expect(zhCNMessages.propertyGrid.resetProperty('名称')).toBe(
      '重置为默认值：名称',
    )
    expect(zhCNMessages.taskCenter.activeTasks(2)).toBe('2 个活动任务')
  })
})
