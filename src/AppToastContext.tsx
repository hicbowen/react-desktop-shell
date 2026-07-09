import { createContext, useContext } from 'react'
import type { AppToast } from './types'

export const AppToastContext = createContext<AppToast | null>(null)

export function useAppToast() {
  const toast = useContext(AppToastContext)

  if (!toast) {
    throw new Error('useAppToast must be used within AppShell')
  }

  return toast
}
