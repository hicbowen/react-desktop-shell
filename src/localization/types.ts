export type AppLocale = 'system' | 'zh-CN' | 'en-US'

export type ResolvedAppLocale = 'zh-CN' | 'en-US'

export type AppLocaleMessages = Record<never, never>

export interface AppLocaleContextValue {
  locale: ResolvedAppLocale
  messages: AppLocaleMessages
  firstDayOfWeek: 0 | 1
  hourCycle: 12 | 24
}
