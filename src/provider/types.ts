import type { CSSProperties, ReactNode } from 'react'
import type { AppClipboardAdapter, AppContextMenuMode } from '../context-menu/types'
import type { AppFilePickerAdapter } from '../file-picker/types'
import type {
  AppLocale,
  AppLocaleMessageOverrides,
} from '../localization/types'
import type { AppThemePreset } from '../theme/AppTheme'
import type { AppThemeTokens } from '../theme/types'
import type { AppToastHostOptions } from '../toast/types'
import type { AppTheme } from '../shell/types'

export interface AppWindowAdapter {
  close?: () => void | Promise<void>
  maximize?: () => void | Promise<void>
  minimize?: () => void | Promise<void>
  restore?: () => void | Promise<void>
  toggleMaximize?: () => void | Promise<void>
  maximized?: boolean
}

export interface AppPlatformAdapter {
  clipboard?: AppClipboardAdapter
  filePicker?: AppFilePickerAdapter
  window?: AppWindowAdapter
  openExternal?: (url: string) => void | Promise<void>
}

export interface AppProviderProps {
  children?: ReactNode
  theme?: AppTheme
  themePreset?: AppThemePreset
  themeTokens?: AppThemeTokens
  locale?: AppLocale
  messages?: AppLocaleMessageOverrides
  firstDayOfWeek?: 0 | 1
  hourCycle?: 12 | 24
  contextMenu?: AppContextMenuMode
  platform?: AppPlatformAdapter
  toastOptions?: AppToastHostOptions
  className?: string
  style?: CSSProperties
}
