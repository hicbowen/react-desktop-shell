import { AppForm, AppFormField, AppNumberBox, useAppForm } from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'
import { useDemoCopy } from '../../i18n/interactiveTranslations'

export function AppNumberBoxPage() {
  const t = useDemoCopy()
  type NumberBoxForm = { duration: number | null; evenValue: number | null; lessonDuration: number | null }
  const form = useAppForm<NumberBoxForm>({ defaultValues: { duration: 45, evenValue: 2, lessonDuration: 60 } })
  return <DemoPage><DemoSection title="Value behaviors"><DemoPreview className="demo-component-row"><AppForm className="demo-form-stack" form={form}><AppFormField<NumberBoxForm, number | null> label={t('Duration')} name="duration">{({ value, setValue }) => <AppNumberBox largeStep={50} max={180} min={1} onValueChange={setValue} step={5} value={value} />}</AppFormField><AppNumberBox allowEmpty defaultValue={null} placeholder={t('Empty')} spinButtonPlacement="compact" /><AppNumberBox defaultValue={1.5} precision={1} spinButtonPlacement="hidden" step={0.1} /><AppNumberBox defaultValue={30} disabled /><AppFormField<NumberBoxForm, number | null> label={t('Even values only')} name="evenValue">{({ value, setValue }) => <AppNumberBox aria-label={t('Even values only')} onValueChange={(next) => { if (next == null || next % 2 === 0) setValue(next) }} value={value} />}</AppFormField></AppForm></DemoPreview><p className="demo-note">{t('Step buttons keep the input focused and apply pending text once. Compact controls open a floating adjustment panel on focus. The final controlled example accepts only even values and restores rejected edits.')}</p><DemoPreview><AppForm form={form}><AppFormField<NumberBoxForm, number | null> label={t('Lesson duration')} name="lessonDuration">{({ value, setValue }) => <AppNumberBox max={180} min={15} onValueChange={setValue} step={15} value={value} />}</AppFormField></AppForm></DemoPreview></DemoSection></DemoPage>
}
