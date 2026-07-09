import { createContext, useContext } from 'react'
import type { AppMessageBox } from './types'

export const AppMessageBoxContext = createContext<AppMessageBox | null>(null)

export function useAppMessageBox() {
  const messageBox = useContext(AppMessageBoxContext)

  if (!messageBox) {
    throw new Error('useAppMessageBox must be used within AppShell')
  }

  return messageBox
}

