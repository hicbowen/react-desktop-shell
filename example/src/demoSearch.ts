import type { DemoPageDefinition } from './demoRegistry'

function normalize(value: string) {
  return value.toLocaleLowerCase().trim()
}

export function searchDemoPages(
  query: string,
  pages: DemoPageDefinition[],
  fallbackPages: DemoPageDefinition[],
) {
  const normalizedQuery = normalize(query)
  if (!normalizedQuery) return []
  const tokens = normalizedQuery.split(/\s+/)

  return pages
    .filter((page) => page.category !== 'getting-started' && page.category !== 'settings')
    .map((page) => {
      const fallback = fallbackPages.find((candidate) => candidate.key === page.key) ?? page
      const api = page.apiNames.map(normalize)
      const labels = [normalize(page.label), normalize(fallback.label)]
      const fields = [
        ...labels,
        ...api,
        normalize(page.description),
        normalize(fallback.description),
        normalize(page.categoryLabel),
        normalize(fallback.categoryLabel),
        normalize(page.subgroupLabel),
        normalize(fallback.subgroupLabel),
      ]
      if (!tokens.every((token) => fields.some((field) => field.includes(token)))) return null
      const score = api.includes(normalizedQuery) ? 100
        : labels.includes(normalizedQuery) ? 90
          : api.some((name) => name.startsWith(normalizedQuery)) ? 80
            : labels.some((label) => label.startsWith(normalizedQuery)) ? 70
              : 10
      return { page, score }
    })
    .filter((result): result is { page: DemoPageDefinition; score: number } => Boolean(result))
    .sort((left, right) => right.score - left.score || left.page.label.localeCompare(right.page.label))
    .map((result) => result.page)
}
