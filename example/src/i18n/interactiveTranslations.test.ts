import { describe, expect, it } from 'vitest'
import { zhCNInteractiveText } from './interactiveTranslations'

describe('interactive demo translations', () => {
  it('contains the first application-frame copy batch', () => {
    expect(zhCNInteractiveText['Open pane']).toBe('打开窗格')
    expect(zhCNInteractiveText['Editor workspace']).toBe('编辑器工作区')
    expect(zhCNInteractiveText.Connected).toBe('已连接')
  })
})
