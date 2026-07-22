export function getDemoHash(key: string) {
  if (key === 'overview') return '#/'
  if (key === 'settings') return '#/settings'
  return `#/components/${encodeURIComponent(key)}`
}

export function getDemoKeyFromHash(hash: string, validKeys: ReadonlySet<string>) {
  const route = hash.replace(/^#\/?/, '')
  const key = route === 'settings'
    ? 'settings'
    : route.startsWith('components/')
      ? decodeURIComponent(route.slice('components/'.length))
      : 'overview'
  return validKeys.has(key) ? key : 'overview'
}
