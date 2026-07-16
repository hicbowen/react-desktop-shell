import { enUSMessages } from './locales/en-US'
import { zhCNMessages } from './locales/zh-CN'
import type { AppLocaleMessages, ResolvedAppLocale } from './types'

export const appLocaleMessages: Record<
  ResolvedAppLocale,
  AppLocaleMessages
> = {
  'en-US': enUSMessages,
  'zh-CN': zhCNMessages,
}
