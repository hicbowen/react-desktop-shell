import { createContext, useContext } from 'react'
import type { AppTheme, PaneDisplayMode } from '../../../src'

type DemoShellValue = {
  theme: AppTheme
  setTheme: (theme: AppTheme) => void
  railDisplayMode: PaneDisplayMode
  setRailDisplayMode: (mode: PaneDisplayMode) => void
}

export const DemoShellContext = createContext<DemoShellValue | null>(null)

export function useDemoShell() {
  const value = useContext(DemoShellContext)
  if (!value) throw new Error('useDemoShell must be used inside DemoShellContext')
  return value
}
