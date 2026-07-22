import { useState } from 'react'
import { Mail, Search } from 'lucide-react'
import { AppField, AppTextBox } from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'
import { useDemoCopy } from '../../i18n/interactiveTranslations'

export function AppTextBoxPage() {
  const t = useDemoCopy()
  const [name, setName] = useState('Ada')
  return <DemoPage><DemoSection title="Text boxes"><DemoPreview className="demo-form-stack"><AppTextBox placeholder={t('Plain input')} /><AppTextBox clearable onChange={(event) => setName(event.target.value)} startIcon={<Search />} value={name} /><AppTextBox endIcon={<Mail />} placeholder={t('Email')} type="email" /><AppTextBox invalid defaultValue={t('Invalid value')} /><AppTextBox disabled value={t('Disabled')} readOnly /><AppTextBox value={t('Read only')} readOnly /><AppTextBox clearable defaultValue="secret" type="password" /><AppTextBox loading placeholder={t('Search while loading')} type="search" /><AppField error={t('Enter a student name')} id="student-input" label={t('Student')}><AppTextBox invalid /></AppField></DemoPreview></DemoSection></DemoPage>
}
