import { useState } from 'react'
import { AppCheckBox, AppForm, AppFormField, AppSearchBox, useAppForm } from '../../../../src'
import { DemoControls, DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'
import { useDemoCopy } from '../../i18n/interactiveTranslations'

export function AppSearchBoxPage() {
  const t = useDemoCopy()
  const [submitted, setSubmitted] = useState('None')
  const [compact, setCompact] = useState(false)
  const form = useAppForm<{ query: string; debouncedQuery: string }>({ defaultValues: { query: '', debouncedQuery: '' } })
  const size = compact ? 'compact' : 'standard'
  return <DemoPage>
    <DemoControls>
      <AppCheckBox checked={compact} label={t('Compact controls')} onCheckedChange={setCompact} />
    </DemoControls>
    <DemoSection title="Search input" description="Value changes stay immediate while explicit and debounced search wait for IME composition to finish.">
      <DemoPreview><AppForm form={form}>
        <div style={{ display: 'grid', gap: 12, maxWidth: 420 }}>
          <AppFormField<{ query: string; debouncedQuery: string }, string> label={t('Search documents')} name="query">{({ setValue, value }) => <AppSearchBox onSearch={(next) => setSubmitted(next || 'None')} onValueChange={setValue} placeholder={t('Search documents')} size={size} value={value} />}</AppFormField>
          <span>{t('Submitted query:')} {t(submitted)}</span>
        </div>
      </AppForm></DemoPreview>
    </DemoSection>
    <DemoSection title="Debounced search">
      <DemoPreview><AppForm form={form}><AppFormField label={t('Search as you type')} name="debouncedQuery">{({ setValue, value }) => <AppSearchBox debounceMs={350} onSearch={setSubmitted} onValueChange={setValue} placeholder={t('Search as you type')} size={size} value={value} />}</AppFormField></AppForm></DemoPreview>
    </DemoSection>
  </DemoPage>
}
