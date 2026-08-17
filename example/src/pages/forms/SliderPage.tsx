import { AppForm, AppFormField, AppSlider, useAppForm } from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'
import { useDemoCopy } from '../../i18n/interactiveTranslations'

export function SliderPage() {
  const t = useDemoCopy()
  type SliderForm = { volume: number; brushSize: number }
  const form = useAppForm<SliderForm>({ defaultValues: { volume: 45, brushSize: 12 } })
  return <DemoPage>
    <AppForm form={form}>
      <DemoSection title="Slider values" description="Use sliders for relative adjustments; use a number box when exact entry is the primary task.">
        <DemoPreview className="demo-form-stack">
          <AppFormField<SliderForm, number> label={t('Volume')} name="volume">
            {({ setValue, value }) => <AppSlider aria-label={t('Volume')} onValueChange={setValue} showValue value={value} />}
          </AppFormField>
        <AppSlider aria-label={t('Zoom')} defaultValue={125} formatValue={(value) => `${value}%`} max={200} min={50} showValue step={25} />
        <AppSlider aria-label={t('Compact slider')} defaultValue={30} size="compact" />
        <AppSlider aria-label={t('Disabled slider')} disabled value={65} />
        <AppSlider aria-label={t('Invalid slider')} invalid value={20} />
          <AppFormField<SliderForm, number> label={t('Brush size')} name="brushSize" orientation="horizontal">
            {({ setValue, value }) => <AppSlider formatValue={(next) => `${next}px`} max={48} min={1} onValueChange={setValue} showValue value={value} />}
          </AppFormField>
        </DemoPreview>
      </DemoSection>
      <DemoSection title="Marks and orientation">
        <DemoPreview className="demo-component-row">
          <AppSlider aria-label={t('Quality')} defaultValue={50} marks={[{ value: 0, label: t('Low') }, { value: 50, label: t('Medium') }, { value: 100, label: t('High') }]} step={10} />
          <AppSlider aria-label={t('Vertical level')} defaultValue={60} marks={[{ value: 0, label: '0' }, { value: 50, label: '50' }, { value: 100, label: '100' }]} orientation="vertical" showValue />
        </DemoPreview>
      </DemoSection>
    </AppForm>
  </DemoPage>
}
