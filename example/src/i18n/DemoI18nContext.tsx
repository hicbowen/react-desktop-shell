import { createContext, useContext } from 'react'
import type { ResolvedAppLocale } from '../../../src/localization/types'
import { enUSDemoMessages, type DemoMessages, zhCNDemoMessages } from './messages'

export type DemoI18nValue = { locale: ResolvedAppLocale; messages: DemoMessages }

export const demoMessages: Record<ResolvedAppLocale, DemoMessages> = {
  'en-US': enUSDemoMessages,
  'zh-CN': zhCNDemoMessages,
}

export const DemoI18nContext = createContext<DemoI18nValue>({ locale: 'en-US', messages: enUSDemoMessages })

export function useDemoI18n() {
  return useContext(DemoI18nContext)
}
