import type { ReactNode } from 'react'
import type { DemoPageDefinition } from '../demoRegistry'
import { useDemoI18n } from '../i18n/DemoI18nContext'

export function DemoComponentPage({
  children,
  definition,
  pages,
  onNavigate,
}: {
  children: ReactNode
  definition: DemoPageDefinition
  pages: DemoPageDefinition[]
  onNavigate: (key: string) => void
}) {
  const { messages } = useDemoI18n()
  const text = messages.componentPage
  const relatedPages = (definition.related ?? [])
    .map((key) => pages.find((page) => page.key === key))
    .filter((page): page is DemoPageDefinition => Boolean(page))

  return (
    <div className="demo-component-page">
      <div className="demo-component-meta" aria-label={text.detailsLabel}>
        <div className="demo-component-meta__context">
          <span>{definition.categoryLabel}</span>
          <span aria-hidden="true">/</span>
          <span>{definition.subgroupLabel}</span>
          <span className={`demo-component-status demo-component-status--${definition.status}`}>
            {text.status[definition.status]}
          </span>
        </div>
        {relatedPages.length ? (
          <div className="demo-component-related">
            <span>{text.related}</span>
            {relatedPages.map((page) => (
              <button key={page.key} onClick={() => onNavigate(page.key)} type="button">
                {page.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      {children}
    </div>
  )
}
