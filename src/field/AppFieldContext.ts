import { createContext, useContext } from 'react'

export interface AppFieldContextValue {
  controlId?: string
  describedBy?: string
  invalid?: boolean
  required?: boolean
  disabled?: boolean
}

export const AppFieldContext = createContext<AppFieldContextValue | null>(null)

export function useAppFieldContext() {
  return useContext(AppFieldContext)
}
