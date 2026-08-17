import { useState } from 'react'
import { AppCheckBox, AppForm, AppFormField, AppPasswordBox, useAppForm } from '../../../../src'
import { DemoControls, DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'
import { useDemoCopy } from '../../i18n/interactiveTranslations'

export function AppPasswordBoxPage() {
  const t = useDemoCopy()
  const [compact, setCompact] = useState(false)
  const form = useAppForm<{ password: string }>({ defaultValues: { password: 'correct horse' } })
  const size = compact ? 'compact' : 'standard'

  return <DemoPage>
    <DemoControls>
      <AppCheckBox checked={compact} label={t('Compact controls')} onCheckedChange={setCompact} />
    </DemoControls>
    <DemoSection title="Password input" description="Reveal controls, Caps Lock feedback, and an application-owned strength slot.">
      <DemoPreview><AppForm form={form}><AppFormField<{ password: string }, string> label="Password" name="password">{({ setValue, value }) => <AppPasswordBox autoComplete="current-password" onChange={(event) => setValue(event.target.value)} size={size} strength={<span>{t('Password strength: good')}</span>} value={value} />}</AppFormField></AppForm></DemoPreview>
    </DemoSection>
  </DemoPage>
}
