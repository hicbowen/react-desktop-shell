import sectionSources from 'virtual:demo-section-sources'
import type { DemoSectionSource } from './DemoSourceContext'

const registrySourceModules = import.meta.glob('../demoRegistry.tsx', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

const registrySource = Object.values(registrySourceModules)[0] ?? ''

function collectPageComponents(source: string) {
  const components = new Map<string, string>()
  const pagePattern =
    /\{\s*key:\s*'([^']+)'[^\n]*?\bcomponent:\s*([A-Za-z_$][\w$]*)/g

  for (const match of source.matchAll(pagePattern)) {
    const key = match[1]
    const component = match[2]
    if (key && component) components.set(key, component)
  }

  return components
}

const pageComponents = collectPageComponents(registrySource)

export interface DemoSource {
  path: string
  sections: DemoSectionSource[]
}

export function getDemoSource(key: string): DemoSource | undefined {
  const component = pageComponents.get(key)
  const source = component ? sectionSources[component] : undefined
  return source
}
