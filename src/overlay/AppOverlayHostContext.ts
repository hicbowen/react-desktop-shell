import { createContext, useContext } from 'react'

export const AppOverlayHostContext = createContext<HTMLDivElement | null>(null)

export function useAppOverlayHost() {
  return useContext(AppOverlayHostContext)
}
