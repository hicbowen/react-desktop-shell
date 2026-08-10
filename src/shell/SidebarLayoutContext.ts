import { createContext, useContext } from 'react'

export interface SidebarLayoutContextValue {
  registerNavigationOverflow: () => () => void
  reportNavigationOverflow: (overflow: boolean) => void
}

export const SidebarLayoutContext =
  createContext<SidebarLayoutContextValue | null>(null)

export function useSidebarLayoutContext() {
  return useContext(SidebarLayoutContext)
}
