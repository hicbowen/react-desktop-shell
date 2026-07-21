import { useState } from 'react'
import { AppAutoComplete, AppField } from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'

const languages = [
  { value: 'TypeScript' },
  { value: 'JavaScript' },
  { value: 'Python' },
  { value: 'Rust' },
  { value: 'Go' },
  { value: 'C#' },
]

export function AutoCompletePage() {
  const [language, setLanguage] = useState('')
  return <DemoPage>
    <DemoSection title="Suggestions" description="Type freely or choose a matching suggestion with the pointer or keyboard.">
      <DemoPreview className="demo-form-stack">
        <AppAutoComplete clearable onValueChange={setLanguage} options={languages} placeholder="Search languages" value={language} />
        <AppAutoComplete defaultValue="Py" options={languages} />
        <AppAutoComplete emptyContent="No matching language" options={languages} defaultValue="Swift" />
        <AppAutoComplete loading options={[]} placeholder="Loading suggestions" />
        <AppAutoComplete disabled options={languages} value="TypeScript" />
        <AppField id="preferred-language" label="Preferred language" orientation="horizontal">
          <AppAutoComplete name="language" options={languages} placeholder="Start typing" />
        </AppField>
      </DemoPreview>
    </DemoSection>
  </DemoPage>
}
