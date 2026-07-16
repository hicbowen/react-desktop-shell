import type { ResolvedAppLocale } from './types'

interface AppLocaleSetting {
  intlLocale: ResolvedAppLocale
  firstDayOfWeek: 0 | 1
  hourCycle: 12 | 24
}

export const appLocaleSettings: Record<
  ResolvedAppLocale,
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
