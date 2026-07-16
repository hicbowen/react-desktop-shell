import { useEffect, useState } from 'react'
import type { AppLocale, ResolvedAppLocale } from './types'

function getSystemLanguages() {
  if (typeof navigator === 'undefined') return []
  if (navigator.languages?.length) return navigator.languages
  return navigator.language ? [navigator.language] : []
}

export function resolveAppLocale(
  locale: AppLocale,
  systemLanguages?: readonly string[],
): ResolvedAppLocale {
  if (locale === 'zh-CN' || locale === 'en-US') return locale

  const languages = systemLanguages ?? getSystemLanguages()
  return languages.some((language) =>
    language.toLowerCase().startsWith('zh'),
  )
    ? 'zh-CN'
    : 'en-US'
}

export function useResolvedAppLocale(locale: AppLocale) {
  const [resolvedLocale, setResolvedLocale] = useState(() =>
    resolveAppLocale(locale),
  )

  useEffect(() => {
    const update = () => setResolvedLocale(resolveAppLocale(locale))
    update()

    if (
      locale !== 'system' ||
      typeof window === 'undefined'
    ) {
      return
    }

    window.addEventListener('languagechange', update)
    return () => window.removeEventListener('languagechange', update)
  }, [locale])

  return resolvedLocale
}
