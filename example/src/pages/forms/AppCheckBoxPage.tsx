import { useState } from 'react'
import { AppCheckBox, AppCheckBoxGroup } from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'

export function AppCheckBoxPage() {
  const [selected, setSelected] = useState(true)
  const [topics, setTopics] = useState(['news'])
  return <DemoPage><DemoSection title="Check boxes"><DemoPreview className="demo-form-stack"><AppCheckBox label="Unchecked" /><AppCheckBox defaultChecked label="Checked" /><AppCheckBox indeterminate label="Partially selected" /><AppCheckBox description="Adds a recommendation section to generated feedback." label="Include learning suggestions" /><AppCheckBox defaultChecked disabled label="Disabled" /><AppCheckBox checked={selected} label="Controlled selection" onCheckedChange={setSelected} /><AppCheckBoxGroup label="Topics" onValueChange={setTopics} options={[{value:'news',label:'News'},{value:'events',label:'Events'},{value:'managed',label:'Managed',disabled:true}]} value={topics} /></DemoPreview></DemoSection></DemoPage>
}
