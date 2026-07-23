const pageSources = import.meta.glob('../pages/**/*.tsx', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

const registrySourceModules = import.meta.glob('../demoRegistry.tsx', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

const registrySource = Object.values(registrySourceModules)[0] ?? ''

function collectComponentPaths(source: string) {
  const paths = new Map<string, string>()
  const importPattern =
    /import\s+\{([^}]+)\}\s+from\s+'(\.\/pages\/[^']+)'/g

  for (const match of source.matchAll(importPattern)) {
    const imports = match[1]
    const importPath = match[2]
    if (!imports || !importPath) continue
    const sourcePath = `..${importPath.slice(1)}.tsx`

    for (const imported of imports.split(',')) {
      const [exportedName, localName = exportedName] = imported
        .trim()
        .split(/\s+as\s+/)
      if (localName) paths.set(localName, sourcePath)
    }
  }

  return paths
}

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

const componentPaths = collectComponentPaths(registrySource)
const pageComponents = collectPageComponents(registrySource)

export interface DemoSource {
  path: string
  source: string
}

export function getDemoSource(key: string): DemoSource | undefined {
  const component = pageComponents.get(key)
  const path = component ? componentPaths.get(component) : undefined
  const source = path ? pageSources[path] : undefined
  return path && source
    ? { path: path.replace(/^\.\.\//, 'example/src/'), source }
    : undefined
}
