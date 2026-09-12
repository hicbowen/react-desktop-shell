import { createContext, useContext } from 'react'
import type { AppDialogProps } from './types'

export interface AppDialogPortalHosts {
  title: HTMLDivElement
  description: HTMLDivElement
  content: HTMLDivElement
  actions: HTMLDivElement
  overlay: HTMLDivElement
}

export interface AppDialogRegistration extends AppDialogProps {
  id: string
  restoreFocusElement: HTMLElement | null
  onDefaultAction?: () => void
  onExited?: () => void
  portalHosts?: AppDialogPortalHosts
  hasTitle?: boolean
  hasDescription?: boolean
  hasContent?: boolean
  hasActions?: boolean
}

export interface AppDialogRegistry {
  register(dialog: AppDialogRegistration): void
  unregister(id: string): void
}

export const AppDialogContext = createContext<AppDialogRegistry | null>(null)

export function useAppDialogRegistry() {
  return useContext(AppDialogContext)
}
