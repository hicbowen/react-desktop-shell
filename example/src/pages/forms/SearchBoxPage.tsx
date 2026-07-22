import { useState } from 'react'
import { AppSearchBox } from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'

export function AppSearchBoxPage() {
  const [query, setQuery] = useState('')
  const [submitted, setSubmitted] = useState('None')
  return <DemoPage><DemoSection title="Search input" description="Value changes stay immediate while search submission can be explicit or debounced."><DemoPreview><div style={{ display: 'grid', gap: 12, maxWidth: 420 }}><AppSearchBox onSearch={(value) => setSubmitted(value || 'None')} onValueChange={setQuery} placeholder="Search documents" value={query} /><span>Submitted query: {submitted}</span></div></DemoPreview></DemoSection><DemoSection title="Debounced search"><DemoPreview><AppSearchBox debounceMs={350} onSearch={setSubmitted} placeholder="Search as you type" /></DemoPreview></DemoSection></DemoPage>
}
