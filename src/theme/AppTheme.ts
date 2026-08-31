import type { CSSProperties } from 'react'
import type { AppThemeTokenOverrides, AppThemeTokens } from './types'

export const APP_THEME_PRESETS = [
  'blue',
  'teal',
  'green',
  'violet',
  'orange',
  'rose',
] as const

export type AppThemePreset = (typeof APP_THEME_PRESETS)[number]

type AppThemeMode = 'light' | 'dark'
type AppThemeTokenName = keyof AppThemeTokenOverrides

const tokenCssSuffixes = {
  accentColor: 'accent-color',
  accentHoverColor: 'accent-hover-color',
  accentPressedColor: 'accent-pressed-color',
  accentTextColor: 'accent-text-color',
  activeBg: 'active-bg',
  focusRingColor: 'focus-ring-color',
  chromeBg: 'chrome-bg',
  contentBg: 'content-bg',
  surfaceBg: 'surface-bg',
  cardBg: 'card-bg',
  cardHoverBg: 'card-hover-bg',
  cardPressedBg: 'card-pressed-bg',
  inputBg: 'input-bg',
  inputHoverBg: 'input-hover-bg',
  inputPressedBg: 'input-pressed-bg',
  inputFocusedBg: 'input-focused-bg',
  inputReadonlyBg: 'input-readonly-bg',
  inputDisabledBg: 'input-disabled-bg',
  inputBorderColor: 'input-border-color',
  inputStrongBorderColor: 'input-strong-border-color',
  inputDisabledStrongBorderColor: 'input-disabled-strong-border-color',
  textColor: 'text-color',
  secondaryTextColor: 'secondary-text-color',
  mutedTextColor: 'muted-text-color',
  disabledTextColor: 'disabled-text-color',
  disabledBg: 'disabled-bg',
  hoverBg: 'hover-bg',
  controlHoverBg: 'control-hover-bg',
  borderColor: 'border-color',
  codeTextColor: 'code-text-color',
  codeBg: 'code-bg',
  successFg: 'success-fg',
  warningFg: 'warning-fg',
  dangerBg: 'danger-bg',
  dangerFg: 'danger-fg',
  dangerSubtleBg: 'danger-subtle-bg',
  infoFg: 'info-fg',
  menuBg: 'menu-bg',
  menuBorderColor: 'menu-border-color',
  dialogOverlayBg: 'dialog-overlay-bg',
  dialogBg: 'dialog-bg',
  dialogBorderColor: 'dialog-border-color',
  dialogButtonBg: 'dialog-button-bg',
  dialogButtonBorderColor: 'dialog-button-border-color',
  dialogPrimaryFg: 'dialog-primary-fg',
  paneScrimBg: 'pane-scrim-bg',
  toastBg: 'toast-bg',
  toastBorderColor: 'toast-border-color',
  scrollbarThumbColor: 'scrollbar-thumb-color',
  scrollbarThumbHoverColor: 'scrollbar-thumb-hover-color',
  scrollbarThumbActiveColor: 'scrollbar-thumb-active-color',
  scrollbarTrackColor: 'scrollbar-track-color',
  scrollbarTrackExpandedColor: 'scrollbar-track-expanded-color',
  scrollbarArrowColor: 'scrollbar-arrow-color',
  scrollbarArrowHoverColor: 'scrollbar-arrow-hover-color',
  scrollbarArrowActiveColor: 'scrollbar-arrow-active-color',
} as const satisfies Record<AppThemeTokenName, string>

export function defineAppTheme(theme: AppThemeTokens): AppThemeTokens {
  return theme
}

function getSourceVariable(mode: AppThemeMode, token: AppThemeTokenName) {
  return `--app-theme-${mode}-${tokenCssSuffixes[token]}`
}

function expandAccentTokens(
  mode: AppThemeMode,
  tokens: AppThemeTokenOverrides,
): AppThemeTokenOverrides {
  if (tokens.accentColor === undefined) return tokens

  const accent = `var(${getSourceVariable(mode, 'accentColor')})`
  return {
    ...tokens,
    accentHoverColor:
      tokens.accentHoverColor ??
      `color-mix(in srgb, ${accent} 90%, black)`,
    accentPressedColor:
      tokens.accentPressedColor ??
      `color-mix(in srgb, ${accent} 80%, black)`,
    accentTextColor:
      tokens.accentTextColor ?? (mode === 'light' ? '#ffffff' : '#00131f'),
    activeBg:
      tokens.activeBg ??
      `color-mix(in srgb, ${accent} ${mode === 'light' ? '8%' : '14%'}, transparent)`,
    focusRingColor: tokens.focusRingColor ?? accent,
    infoFg: tokens.infoFg ?? accent,
  }
}

function addModeTokens(
  style: Record<string, string>,
  mode: AppThemeMode,
  common: AppThemeTokenOverrides | undefined,
  overrides: AppThemeTokenOverrides | undefined,
) {
  const tokens = expandAccentTokens(mode, { ...common, ...overrides })

  for (const token of Object.keys(tokenCssSuffixes) as AppThemeTokenName[]) {
    const value = tokens[token]
    if (value !== undefined) style[getSourceVariable(mode, token)] = value
  }
}

export function getAppThemeStyle(
  theme: AppThemeTokens | undefined,
): CSSProperties | undefined {
  if (!theme) return undefined

  const style: Record<string, string> = {}
  addModeTokens(style, 'light', theme.common, theme.light)
  addModeTokens(style, 'dark', theme.common, theme.dark)
  return style as CSSProperties
}
