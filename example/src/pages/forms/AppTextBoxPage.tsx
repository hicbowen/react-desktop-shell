import { useState } from 'react'
import { Mail, Search } from '../../components/fluentIcons'
import { AppCheckBox, AppForm, AppFormField, AppTextBox, useAppForm } from '../../../../src'
import { DemoControls, DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'
import { useDemoCopy } from '../../i18n/interactiveTranslations'

export function AppTextBoxPage() {
  const t = useDemoCopy()
  const [compact, setCompact] = useState(false)
  const size = compact ? 'compact' : 'standard'
  type TextBoxForm = { name: string; student: string }
  const form = useAppForm<TextBoxForm>({ defaultValues: { name: 'Ada', student: '' } })

  return <DemoPage>
    <DemoControls>
      <AppCheckBox checked={compact} label={t('Compact controls')} onCheckedChange={setCompact} />
    </DemoControls>
    <DemoSection title="Text boxes">
      <DemoPreview className="demo-form-stack">
        <AppForm className="demo-form-stack" form={form}>
          <AppTextBox placeholder={t('Plain input')} size={size} />
          <AppFormField<TextBoxForm, string> label={t('Controlled name')} name="name">
            {({ value, setValue }) => <AppTextBox clearable onChange={(event) => setValue(event.currentTarget.value)} size={size} startIcon={<Search />} value={String(value ?? '')} />}
          </AppFormField>
          <AppTextBox endIcon={<Mail />} placeholder={t('Email')} size={size} type="email" />
          <AppTextBox invalid defaultValue={t('Invalid value')} size={size} />
          <AppTextBox disabled readOnly size={size} value={t('Disabled')} />
          <AppTextBox readOnly size={size} value={t('Read only')} />
          <AppTextBox clearable defaultValue="secret" size={size} type="password" />
          <AppTextBox loading placeholder={t('Search while loading')} size={size} type="search" />
          <AppFormField<TextBoxForm, string> label={t('Student')} name="student" required>
            {({ value, setValue }) => <AppTextBox invalid={value === ''} size={size} value={String(value ?? '')} onChange={(event) => setValue(event.currentTarget.value)} />}
          </AppFormField>
        </AppForm>
      </DemoPreview>
    </DemoSection>
  </DemoPage>
}
