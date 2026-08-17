import { AppForm, AppFormField, AppTextArea, useAppForm } from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'
import { useDemoCopy } from '../../i18n/interactiveTranslations'

export function AppTextAreaPage() {
  const t = useDemoCopy()
  type TextAreaForm = { notes: string }
  const form = useAppForm<TextAreaForm>({ defaultValues: { notes: t('Full-width notes') } })
  return <DemoPage><DemoSection title="Text areas"><DemoPreview className="demo-form-stack"><AppForm className="demo-form-stack" form={form}><AppTextArea defaultValue={t('Fixed height text')} resize="vertical" /><AppTextArea autoResize defaultValue={t('Line one\nLine two\nLine three')} maxRows={6} minRows={2} /><AppTextArea defaultValue={t('Counted text')} maxLength={120} showCount /><AppFormField<TextAreaForm, string> label={t('Notes')} name="notes">{({ value, setValue }) => <AppTextArea fullWidth value={value} onChange={(event) => setValue(event.currentTarget.value)} />}</AppFormField></AppForm></DemoPreview></DemoSection></DemoPage>
}
