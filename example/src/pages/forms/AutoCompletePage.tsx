import { useState } from 'react'
import { AppAutoComplete, AppCheckBox, AppForm, AppFormField, useAppForm } from '../../../../src'
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

type AutoCompleteDemoForm = { language: string }

export function AutoCompletePage() {
  const t = useDemoCopy()
  const [compact, setCompact] = useState(false)
  const size = compact ? 'compact' : 'standard'
  const form = useAppForm<AutoCompleteDemoForm>({ defaultValues: { language: '' } })
  return <DemoPage>
    <DemoControls>
      <AppCheckBox checked={compact} label={t('Compact controls')} onCheckedChange={setCompact} />
    </DemoControls>
    <DemoSection title="Suggestions" description="Type freely or choose a matching suggestion with the pointer or keyboard.">
      <DemoPreview className="demo-form-stack">
        <AppForm className="demo-form-stack" form={form}>
          <AppFormField<AutoCompleteDemoForm, string> label={t('Preferred language')} name="language">
            {({ value, setValue }) => <AppAutoComplete clearable onValueChange={setValue} options={languages} placeholder={t('Search languages')} size={size} value={value} />}
          </AppFormField>
          <AppAutoComplete defaultValue="Py" options={languages} size={size} />
          <AppAutoComplete defaultValue="Swift" emptyContent={t('No matching language')} options={languages} size={size} />
          <AppAutoComplete loading options={[]} placeholder={t('Loading suggestions')} size={size} />
          <AppAutoComplete disabled options={languages} size={size} value="TypeScript" />
        </AppForm>
      </DemoPreview>
    </DemoSection>
  </DemoPage>
}
