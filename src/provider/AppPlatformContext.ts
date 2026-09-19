import { createContext, useContext } from 'react'
import type { AppPlatformAdapter } from './types'

export const AppPlatformContext = createContext<AppPlatformAdapter>({})

export function useAppPlatform() {
  return useContext(AppPlatformContext)
}
