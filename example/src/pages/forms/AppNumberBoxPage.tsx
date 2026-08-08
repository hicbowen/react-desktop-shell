import { useState } from 'react'
import { AppField, AppNumberBox } from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'
import { useDemoCopy } from '../../i18n/interactiveTranslations'

export function AppNumberBoxPage() {
  const t = useDemoCopy()
  const [duration, setDuration] = useState<number | null>(45)
  const [evenValue, setEvenValue] = useState<number | null>(2)
  return <DemoPage><DemoSection title="Value behaviors"><DemoPreview className="demo-component-row"><AppNumberBox largeStep={50} max={180} min={1} onValueChange={setDuration} step={5} value={duration} /><AppNumberBox allowEmpty defaultValue={null} placeholder={t('Empty')} spinButtonPlacement="compact" /><AppNumberBox defaultValue={1.5} precision={1} spinButtonPlacement="hidden" step={0.1} /><AppNumberBox defaultValue={30} disabled /><AppNumberBox aria-label={t('Even values only')} onValueChange={(next) => { if (next == null || next % 2 === 0) setEvenValue(next) }} value={evenValue} /></DemoPreview><p className="demo-note">{t('Step buttons keep the input focused and apply pending text once. Compact controls open a floating adjustment panel on focus. The final controlled example accepts only even values and restores rejected edits.')}</p><DemoPreview><AppField id="duration" label={t('Lesson duration')} orientation="horizontal"><AppNumberBox max={180} min={15} step={15} defaultValue={60} /></AppField></DemoPreview></DemoSection></DemoPage>
}
