import { enUSMessages } from './locales/en-US'
import { zhCNMessages } from './locales/zh-CN'
import type { AppLocaleMessages, BuiltInAppLocale } from './types'

export const appLocaleMessages: Record<
  BuiltInAppLocale,
  AppLocaleMessages
> = {
  'en-US': enUSMessages,
  'zh-CN': zhCNMessages,
}
