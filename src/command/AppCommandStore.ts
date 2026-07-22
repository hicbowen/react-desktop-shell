import { createContext } from 'react'
import type { AppCommandApi } from './types'

export const AppCommandContext = createContext<AppCommandApi | null>(null)
