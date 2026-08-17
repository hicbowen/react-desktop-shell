import { AppForm, AppFormField, AppSettingsRow, AppToggleSwitch, useAppForm } from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'

export function AppToggleSwitchPage() {
  type ToggleForm = { preview: boolean }
  const form = useAppForm<ToggleForm>({ defaultValues: { preview: false } })
  return <DemoPage><DemoSection title="Toggle switches"><DemoPreview className="demo-form-stack"><AppForm className="demo-form-stack" form={form}><AppToggleSwitch label="Receive updates" /><AppToggleSwitch defaultChecked label="Automatic save" labelPosition="start" /><AppToggleSwitch description="May include features that are not yet stable." label="Preview channel" size="compact" /><AppToggleSwitch disabled label="Managed setting" /><AppFormField<ToggleForm, boolean> label="Beta updates" name="preview">{({ value, setValue }) => <AppSettingsRow title="Beta updates" description="Try upcoming desktop features." control={<AppToggleSwitch aria-label="Beta updates" checked={value} onCheckedChange={setValue} />} />}</AppFormField></AppForm></DemoPreview></DemoSection></DemoPage>
}
