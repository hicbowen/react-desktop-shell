import { describe, expect, it } from 'vitest'
import { zhCNInteractiveText } from '../../i18n/interactiveTranslations'
import { createColumns, createTableControls, localizeTableValue } from './tableConfig'

const t = (text: string) => zhCNInteractiveText[text] ?? text

describe('localized data table configuration', () => {
  it('localizes column and filter labels', () => {
    expect(createColumns(t).map((column) => column.header)).toEqual([
      '名称',
      '类别',
      '状态',
      '负责人',
      '优先级',
      '区域',
      '更新时间',
    ])
    expect(createTableControls(t).filters?.map((filter) => filter.label)).toEqual([
      '类别',
      '状态',
      '负责人',
      '优先级',
      '区域',
    ])
  })

  it('keeps filter values stable while translating their labels', () => {
    const statusFilter = createTableControls(t).filters?.find((filter) => filter.columnId === 'status')

    expect(statusFilter?.options).toContainEqual({ value: 'Processing', label: '处理中' })
    expect(localizeTableValue(t, 'Alpha item 17')).toBe('Alpha 项目 17')
  })
})
