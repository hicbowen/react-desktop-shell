import type { BuiltInAppLocale } from './types'

interface AppLocaleSetting {
  intlLocale: BuiltInAppLocale
  firstDayOfWeek: 0 | 1
  hourCycle: 12 | 24
}

export const appLocaleSettings: Record<
  BuiltInAppLocale,
  AppLocaleSetting
> = {
  'zh-CN': {
    intlLocale: 'zh-CN',
    firstDayOfWeek: 1,
    hourCycle: 24,
  },
  'en-US': {
    intlLocale: 'en-US',
    firstDayOfWeek: 0,
    hourCycle: 12,
  },
}
