import { createContext } from 'react'
import type { AppLocaleContextValue } from './types'

export const AppLocaleContext =
  createContext<AppLocaleContextValue | null>(null)
