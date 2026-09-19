import {
  useMemo,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from 'react'
import type { AppClipboardAdapter, AppContextMenuMode } from '../context-menu/types'
import { defaultClipboardAdapter } from '../context-menu/AppContextMenuTextActions'
import { useContextMenuController } from '../context-menu/useContextMenuController'
import { useDialogController } from '../dialog/useDialogController'
import { appLocaleSettings } from '../localization/localeSettings'
import { appLocaleMessages } from '../localization/messages'
import { useResolvedAppLocale } from '../localization/resolveAppLocale'
import type {
  AppLocale,
  AppLocaleContextValue,
  AppLocaleMessageOverrides,
  AppLocaleMessages,
  ResolvedAppLocale,
} from '../localization/types'
import { useToastStore } from '../toast/AppToastHost'
import type { AppToastHostOptions } from '../toast/types'
import type { AppPlatformAdapter } from './types'

function mergeMessages(
  base: AppLocaleMessages,
  overrides: AppLocaleMessageOverrides | undefined,
): AppLocaleMessages {
  if (!overrides) return base

  const merged = { ...base } as Record<string, unknown>
  for (const key of Object.keys(overrides) as (keyof AppLocaleMessages)[]) {
    const override = overrides[key]
    if (override === undefined) continue
    merged[key] = { ...base[key], ...override }
  }
  return merged as unknown as AppLocaleMessages
}

function getLocaleSettings(locale: ResolvedAppLocale) {
  if (locale === 'zh-CN' || locale === 'en-US') {
    return appLocaleSettings[locale as 'zh-CN' | 'en-US']
  }

  return {
    intlLocale: locale,
    firstDayOfWeek: 1 as const,
    hourCycle: 24 as const,
  }
}

export function useAppLocaleContextValue({
  firstDayOfWeek,
  hourCycle,
  locale,
  messages,
}: {
  firstDayOfWeek?: 0 | 1
  hourCycle?: 12 | 24
  locale: AppLocale
  messages?: AppLocaleMessageOverrides
}) {
  const resolvedLocale = useResolvedAppLocale(locale)

  return useMemo<AppLocaleContextValue>(() => {
    const settings = getLocaleSettings(resolvedLocale)
    const builtInMessages =
      resolvedLocale === 'zh-CN'
        ? appLocaleMessages['zh-CN']
        : appLocaleMessages['en-US']

    return {
      locale: settings.intlLocale,
      messages: mergeMessages(builtInMessages, messages),
      firstDayOfWeek: firstDayOfWeek ?? settings.firstDayOfWeek,
      hourCycle: hourCycle ?? settings.hourCycle,
    }
  }, [firstDayOfWeek, hourCycle, messages, resolvedLocale])
}

export interface AppServices {
  contextMenuController: ReturnType<typeof useContextMenuController>
  dialogController: ReturnType<typeof useDialogController>
  localeContextValue: AppLocaleContextValue
  overlayHost: HTMLDivElement | null
  platformValue: AppPlatformAdapter
  setOverlayHost: Dispatch<SetStateAction<HTMLDivElement | null>>
  toastStore: ReturnType<typeof useToastStore>
}

export function useAppServices({
  clipboard,
  contextMenu,
  firstDayOfWeek,
  hourCycle,
  locale,
  messages,
  platform,
  rootRef,
  toastOptions,
}: {
  clipboard?: AppClipboardAdapter
  contextMenu: AppContextMenuMode
  firstDayOfWeek?: 0 | 1
  hourCycle?: 12 | 24
  locale: AppLocale
  messages?: AppLocaleMessageOverrides
  platform?: AppPlatformAdapter
  rootRef: RefObject<HTMLDivElement | null>
  toastOptions?: AppToastHostOptions
}): AppServices {
  const localeContextValue = useAppLocaleContextValue({
    firstDayOfWeek,
    hourCycle,
    locale,
    messages,
  })
  const platformValue = useMemo<AppPlatformAdapter>(
    () => ({
      ...platform,
      clipboard: clipboard ?? platform?.clipboard ?? defaultClipboardAdapter,
    }),
    [clipboard, platform],
  )
  const contextMenuController = useContextMenuController({
    rootRef,
    mode: contextMenu,
    clipboard: platformValue.clipboard ?? defaultClipboardAdapter,
    messages: localeContextValue.messages.contextMenu,
  })
  const dialogController = useDialogController(
    localeContextValue.messages.common,
    contextMenuController.dismissMenu,
  )
  const toastStore = useToastStore(toastOptions)
  const [overlayHost, setOverlayHost] = useState<HTMLDivElement | null>(null)

  return {
    contextMenuController,
    dialogController,
    localeContextValue,
    overlayHost,
    platformValue,
    setOverlayHost,
    toastStore,
  }
}
