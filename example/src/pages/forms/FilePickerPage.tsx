import { AppFilePicker, AppForm, AppFormField, useAppForm } from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'

type FilePickerForm = {
  files: File[]
}

export function AppFilePickerPage() {
  const form = useAppForm<FilePickerForm>({ defaultValues: { files: [] } })
  return <DemoPage><DemoSection title="File selection" description="Choose or drop files with shared type, count, and size validation."><DemoPreview><AppForm form={form}><AppFormField<FilePickerForm, File[]> label="Attachments" name="files">{({ setValue, value }) => <div style={{ maxWidth: 560 }}><AppFilePicker accept={['image/*', '.pdf']} files={value} maxFileSize={10 * 1024 * 1024} multiple onFilesChange={setValue} /></div>}</AppFormField></AppForm></DemoPreview></DemoSection></DemoPage>
}
