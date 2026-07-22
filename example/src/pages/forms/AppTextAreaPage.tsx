import { AppTextArea } from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'

export function AppTextAreaPage() {
  return <DemoPage><DemoSection title="Text areas"><DemoPreview className="demo-form-stack"><AppTextArea defaultValue="Fixed height text" resize="vertical" /><AppTextArea autoResize defaultValue={'Line one\nLine two\nLine three'} maxRows={6} minRows={2} /><AppTextArea defaultValue="Counted text" maxLength={120} showCount /></DemoPreview></DemoSection></DemoPage>
}
