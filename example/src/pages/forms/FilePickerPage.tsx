import { AppFilePicker } from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'

export function AppFilePickerPage() {
  return <DemoPage><DemoSection title="File selection" description="Choose or drop files with shared type, count, and size validation."><DemoPreview><div style={{ maxWidth: 560 }}><AppFilePicker accept={['image/*', '.pdf']} maxFileSize={10 * 1024 * 1024} multiple /></div></DemoPreview></DemoSection></DemoPage>
}
