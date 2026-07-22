import { createContext, useContext } from 'react'
import type { AppLocale, AppTheme, PaneDisplayMode } from '../../../src'

type DemoShellValue = {
  theme: AppTheme
  setTheme: (theme: AppTheme) => void
  locale: AppLocale
  setLocale: (locale: AppLocale) => void
  railDisplayMode: PaneDisplayMode
  setRailDisplayMode: (mode: PaneDisplayMode) => void
  pages?: readonly { key: string; category: string }[]
  navigateTo?: (key: string) => void
}

export const DemoShellContext = createContext<DemoShellValue | null>(null)

export function useDemoShell() {
  const value = useContext(DemoShellContext)
  if (!value) throw new Error('useDemoShell must be used inside DemoShellContext')
  return value
}
