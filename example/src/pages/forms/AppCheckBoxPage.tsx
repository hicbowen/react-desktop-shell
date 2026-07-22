import { useState } from 'react'
import { AppCheckBox } from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'

export function AppCheckBoxPage() {
  const [selected, setSelected] = useState(true)
  return <DemoPage><DemoSection title="Check boxes"><DemoPreview className="demo-form-stack"><AppCheckBox label="Unchecked" /><AppCheckBox defaultChecked label="Checked" /><AppCheckBox indeterminate label="Partially selected" /><AppCheckBox description="Adds a recommendation section to generated feedback." label="Include learning suggestions" /><AppCheckBox defaultChecked disabled label="Disabled" /><AppCheckBox checked={selected} label="Controlled selection" onCheckedChange={setSelected} /></DemoPreview></DemoSection></DemoPage>
}
