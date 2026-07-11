import { createContext, useContext } from 'react'
import type { AppDialogProps } from './types'

export interface AppDialogRegistration extends AppDialogProps {
  id: string
  restoreFocusElement: HTMLElement | null
  onDefaultAction?: () => void
}

export interface AppDialogRegistry {
  register(dialog: AppDialogRegistration): void
  unregister(id: string): void
}

export const AppDialogContext = createContext<AppDialogRegistry | null>(null)

export function useAppDialogRegistry() {
  return useContext(AppDialogContext)
}
