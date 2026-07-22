import { useState } from 'react'
import { AppSearchBox } from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'
import { useDemoCopy } from '../../i18n/interactiveTranslations'

export function AppSearchBoxPage() {
  const t = useDemoCopy()
  const [query, setQuery] = useState('')
  const [submitted, setSubmitted] = useState('None')
  return <DemoPage><DemoSection title="Search input" description="Value changes stay immediate while search submission can be explicit or debounced."><DemoPreview><div style={{ display: 'grid', gap: 12, maxWidth: 420 }}><AppSearchBox onSearch={(value) => setSubmitted(value || 'None')} onValueChange={setQuery} placeholder={t('Search documents')} value={query} /><span>{t('Submitted query:')} {t(submitted)}</span></div></DemoPreview></DemoSection><DemoSection title="Debounced search"><DemoPreview><AppSearchBox debounceMs={350} onSearch={setSubmitted} placeholder={t('Search as you type')} /></DemoPreview></DemoSection></DemoPage>
}
