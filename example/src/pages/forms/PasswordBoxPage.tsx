import { useState } from 'react'
import { AppCheckBox, AppPasswordBox } from '../../../../src'
import { DemoControls, DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'
import { useDemoCopy } from '../../i18n/interactiveTranslations'

export function AppPasswordBoxPage() {
  const t = useDemoCopy()
  const [compact, setCompact] = useState(false)
  const size = compact ? 'compact' : 'standard'

  return <DemoPage>
    <DemoControls>
      <AppCheckBox checked={compact} label={t('Compact controls')} onCheckedChange={setCompact} />
    </DemoControls>
    <DemoSection title="Password input" description="Reveal controls, Caps Lock feedback, and an application-owned strength slot.">
      <DemoPreview>
        <AppPasswordBox autoComplete="current-password" defaultValue="correct horse" size={size} strength={<span>{t('Password strength: good')}</span>} />
      </DemoPreview>
    </DemoSection>
  </DemoPage>
}
