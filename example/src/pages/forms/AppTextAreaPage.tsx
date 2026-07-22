import { AppTextArea } from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'
import { useDemoCopy } from '../../i18n/interactiveTranslations'

export function AppTextAreaPage() {
  const t = useDemoCopy()
  return <DemoPage><DemoSection title="Text areas"><DemoPreview className="demo-form-stack"><AppTextArea defaultValue={t('Fixed height text')} resize="vertical" /><AppTextArea autoResize defaultValue={t('Line one\nLine two\nLine three')} maxRows={6} minRows={2} /><AppTextArea defaultValue={t('Counted text')} maxLength={120} showCount /></DemoPreview></DemoSection></DemoPage>
}
