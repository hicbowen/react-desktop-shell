import { useContext, useMemo } from 'react'
import { AppLocaleContext } from './AppLocaleContext'
import { appLocaleSettings } from './localeSettings'
import { appLocaleMessages } from './messages'
import { useResolvedAppLocale } from './resolveAppLocale'

export function useAppLocale() {
  const context = useContext(AppLocaleContext)
  const systemLocale = useResolvedAppLocale('system')
  const fallback = useMemo(() => {
    const settings = appLocaleSettings[systemLocale]
    return {
      locale: settings.intlLocale,
      messages: appLocaleMessages[systemLocale],
      firstDayOfWeek: settings.firstDayOfWeek,
      hourCycle: settings.hourCycle,
    }
  }, [systemLocale])

  return context ?? fallback
}
