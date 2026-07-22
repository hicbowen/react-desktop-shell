import { useMemo, useState, type FocusEvent } from 'react'
import { AppSearchBox } from '../../../src'
import type { DemoPageDefinition } from '../demoRegistry'
import { searchDemoPages } from '../demoSearch'
import { useDemoI18n } from '../i18n/DemoI18nContext'

export function DemoSearch({ pages, fallbackPages, onNavigate }: { pages: DemoPageDefinition[]; fallbackPages: DemoPageDefinition[]; onNavigate: (key: string) => void }) {
  const { messages } = useDemoI18n()
  const text = messages.search
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const results = useMemo(() => searchDemoPages(query, pages, fallbackPages).slice(0, 8), [fallbackPages, pages, query])
  const select = (page: DemoPageDefinition) => {
    onNavigate(page.key)
    setQuery('')
    setFocused(false)
  }
  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false)
  }

  return <div className="demo-search" onBlur={handleBlur} onFocus={() => setFocused(true)}>
    <AppSearchBox aria-label={text.label} onSearch={() => results[0] && select(results[0])} onValueChange={setQuery} placeholder={text.placeholder} value={query} />
    {focused && query ? <div className="demo-search__results" aria-label={text.results}>
      {results.length ? results.map((page) => <button key={page.key} onClick={() => select(page)} type="button"><span><strong>{page.label}</strong><small>{page.apiNames.join(' · ')}</small></span><em>{page.subgroupLabel}</em></button>) : <p>{text.empty}</p>}
    </div> : null}
  </div>
}
