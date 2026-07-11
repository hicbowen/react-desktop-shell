import { theme } from 'antd'
import type { ThemeConfig } from 'antd'
import type { CreateAntdThemeOptions } from './types'

const fontFamily =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif'

const lightToken: NonNullable<ThemeConfig['token']> = {
  colorPrimary: '#115ea3',
  colorText: '#1f1f1f',
  colorTextSecondary: '#707070',
  colorTextDisabled: 'rgba(0, 0, 0, 0.36)',
  colorBgBase: '#f7f8fa',
  colorBgLayout: '#f7f8fa',
  colorBgContainer: '#ffffff',
  colorBgElevated: '#ffffff',
  colorBorder: 'rgba(0, 0, 0, 0.12)',
  colorBorderSecondary: 'rgba(0, 0, 0, 0.08)',
  colorFill: 'rgba(0, 0, 0, 0.10)',
  colorFillSecondary: 'rgba(0, 0, 0, 0.06)',
  borderRadius: 6,
  borderRadiusLG: 8,
  controlHeight: 32,
  fontSize: 14,
  fontFamily,
  lineWidth: 1,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.10)',
  boxShadowSecondary: '0 8px 24px rgba(0, 0, 0, 0.16)',
}

const darkToken: NonNullable<ThemeConfig['token']> = {
  colorPrimary: '#60cdff',
  colorText: '#ffffff',
  colorTextSecondary: '#a6a6a6',
  colorTextDisabled: 'rgba(255, 255, 255, 0.36)',
  colorBgBase: '#272727',
  colorBgLayout: '#272727',
  colorBgContainer: '#2d2d2d',
  colorBgElevated: '#2d2d2d',
  colorBorder: 'rgba(255, 255, 255, 0.12)',
  colorBorderSecondary: 'rgba(255, 255, 255, 0.08)',
  colorFill: 'rgba(255, 255, 255, 0.12)',
  colorFillSecondary: 'rgba(255, 255, 255, 0.08)',
  borderRadius: 6,
  borderRadiusLG: 8,
  controlHeight: 32,
  fontSize: 14,
  fontFamily,
  lineWidth: 1,
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.28)',
  boxShadowSecondary: '0 10px 28px rgba(0, 0, 0, 0.46)',
}

export function createAntdTheme(
  options: CreateAntdThemeOptions = {},
): ThemeConfig {
  const mode = options.mode ?? 'light'
  const presetToken = mode === 'dark' ? darkToken : lightToken

  return {
    algorithm:
      mode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      ...presetToken,
      ...options.token,
    },
  }
}
