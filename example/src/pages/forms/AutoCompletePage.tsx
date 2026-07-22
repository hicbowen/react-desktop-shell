import { useState } from 'react'
import { AppAutoComplete, AppField } from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'
import { useDemoCopy } from '../../i18n/interactiveTranslations'

const languages = [
  { value: 'TypeScript' },
  { value: 'JavaScript' },
  { value: 'Python' },
  { value: 'Rust' },
  { value: 'Go' },
  { value: 'C#' },
]

export function AutoCompletePage() {
  const t = useDemoCopy()
  const [language, setLanguage] = useState('')
  return <DemoPage>
    <DemoSection title="Suggestions" description="Type freely or choose a matching suggestion with the pointer or keyboard.">
      <DemoPreview className="demo-form-stack">
        <AppAutoComplete clearable onValueChange={setLanguage} options={languages} placeholder={t('Search languages')} value={language} />
        <AppAutoComplete defaultValue="Py" options={languages} />
        <AppAutoComplete emptyContent={t('No matching language')} options={languages} defaultValue="Swift" />
        <AppAutoComplete loading options={[]} placeholder={t('Loading suggestions')} />
        <AppAutoComplete disabled options={languages} value="TypeScript" />
        <AppField id="preferred-language" label={t('Preferred language')} orientation="horizontal">
          <AppAutoComplete name="language" options={languages} placeholder={t('Start typing')} />
        </AppField>
      </DemoPreview>
    </DemoSection>
  </DemoPage>
}
