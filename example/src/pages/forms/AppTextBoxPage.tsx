import { useState } from 'react'
import { Mail, Search } from '../../components/fluentIcons'
import { AppCheckBox, AppField, AppTextBox } from '../../../../src'
import { DemoControls, DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'
import { useDemoCopy } from '../../i18n/interactiveTranslations'

export function AppTextBoxPage() {
  const t = useDemoCopy()
  const [name, setName] = useState('Ada')
  const [compact, setCompact] = useState(false)
  const size = compact ? 'compact' : 'standard'

  return <DemoPage>
    <DemoControls>
      <AppCheckBox checked={compact} label={t('Compact controls')} onCheckedChange={setCompact} />
    </DemoControls>
    <DemoSection title="Text boxes">
      <DemoPreview className="demo-form-stack">
        <AppTextBox placeholder={t('Plain input')} size={size} />
        <AppTextBox clearable onChange={(event) => setName(event.target.value)} size={size} startIcon={<Search />} value={name} />
        <AppTextBox endIcon={<Mail />} placeholder={t('Email')} size={size} type="email" />
        <AppTextBox invalid defaultValue={t('Invalid value')} size={size} />
        <AppTextBox disabled readOnly size={size} value={t('Disabled')} />
        <AppTextBox readOnly size={size} value={t('Read only')} />
        <AppTextBox clearable defaultValue="secret" size={size} type="password" />
        <AppTextBox loading placeholder={t('Search while loading')} size={size} type="search" />
        <AppField error={t('Enter a student name')} id="student-input" label={t('Student')}>
          <AppTextBox invalid size={size} />
        </AppField>
      </DemoPreview>
    </DemoSection>
  </DemoPage>
}
