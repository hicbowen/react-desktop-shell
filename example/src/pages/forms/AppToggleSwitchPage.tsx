import { useState } from 'react'
import { AppSettingsRow, AppToggleSwitch } from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'

export function AppToggleSwitchPage() {
  const [preview, setPreview] = useState(false)
  return <DemoPage><DemoSection title="Toggle switches"><DemoPreview className="demo-form-stack"><AppToggleSwitch label="Receive updates" /><AppToggleSwitch defaultChecked label="Automatic save" labelPosition="start" /><AppToggleSwitch description="May include features that are not yet stable." label="Preview channel" size="compact" /><AppToggleSwitch disabled label="Managed setting" /><AppSettingsRow title="Beta updates" description="Try upcoming desktop features." control={<AppToggleSwitch aria-label="Beta updates" checked={preview} onCheckedChange={setPreview} />} /></DemoPreview></DemoSection></DemoPage>
}
