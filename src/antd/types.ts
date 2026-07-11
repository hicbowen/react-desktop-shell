import type { ThemeConfig } from 'antd'

export type AntdThemeMode = 'light' | 'dark'

export interface CreateAntdThemeOptions {
  mode?: AntdThemeMode
  token?: ThemeConfig['token']
}
