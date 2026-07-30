import { createContext } from 'react'

export interface DemoSectionSource {
  source: string
  highlightedHtml: string
}

export interface DemoSourceContextValue {
  path: string
  sections: DemoSectionSource[]
}

export const DemoSourceContext =
  createContext<DemoSourceContextValue | null>(null)
