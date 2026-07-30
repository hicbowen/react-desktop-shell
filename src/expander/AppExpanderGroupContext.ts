import { createContext, useContext } from 'react'

export interface AppExpanderGroupContextValue {
  isExpanded: (value: string) => boolean
  requestExpandedChange: (value: string, expanded: boolean) => boolean
}

export const AppExpanderGroupContext =
  createContext<AppExpanderGroupContextValue | null>(null)

export function useAppExpanderGroupContext() {
  return useContext(AppExpanderGroupContext)
}
