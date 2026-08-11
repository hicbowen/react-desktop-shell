import { useState } from 'react'
import { AppAutoComplete, AppCheckBox, AppField } from '../../../../src'
import { DemoControls, DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'
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
  const [compact, setCompact] = useState(false)
  const size = compact ? 'compact' : 'standard'
  return <DemoPage>
    <DemoControls>
      <AppCheckBox checked={compact} label={t('Compact controls')} onCheckedChange={setCompact} />
    </DemoControls>
    <DemoSection title="Suggestions" description="Type freely or choose a matching suggestion with the pointer or keyboard.">
      <DemoPreview className="demo-form-stack">
        <AppAutoComplete clearable onValueChange={setLanguage} options={languages} placeholder={t('Search languages')} size={size} value={language} />
        <AppAutoComplete defaultValue="Py" options={languages} size={size} />
        <AppAutoComplete defaultValue="Swift" emptyContent={t('No matching language')} options={languages} size={size} />
        <AppAutoComplete loading options={[]} placeholder={t('Loading suggestions')} size={size} />
        <AppAutoComplete disabled options={languages} size={size} value="TypeScript" />
        <AppField id="preferred-language" label={t('Preferred language')} orientation="horizontal">
          <AppAutoComplete name="language" options={languages} placeholder={t('Start typing')} size={size} />
        </AppField>
      </DemoPreview>
    </DemoSection>
  </DemoPage>
}
