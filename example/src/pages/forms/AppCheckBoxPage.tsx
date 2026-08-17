import { AppCheckBox, AppCheckBoxGroup, AppForm, AppFormField, useAppForm } from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'

export function AppCheckBoxPage() {
  type CheckBoxForm = { selected: boolean; topics: string[] }
  const form = useAppForm<CheckBoxForm>({ defaultValues: { selected: true, topics: ['news'] } })
  return <DemoPage><DemoSection title="Check boxes"><DemoPreview className="demo-form-stack"><AppForm className="demo-form-stack" form={form}><AppCheckBox label="Unchecked" /><AppCheckBox defaultChecked label="Checked" /><AppCheckBox indeterminate label="Partially selected" /><AppCheckBox description="Adds a recommendation section to generated feedback." label="Include learning suggestions" /><AppCheckBox defaultChecked disabled label="Disabled" /><AppFormField<CheckBoxForm, boolean> label="Controlled selection" name="selected">{({ value, setValue }) => <AppCheckBox checked={value} onCheckedChange={setValue} />}</AppFormField><AppFormField<CheckBoxForm, string[]> label="Topics" name="topics">{({ value, setValue }) => <AppCheckBoxGroup onValueChange={setValue} options={[{value:'news',label:'News'},{value:'events',label:'Events'},{value:'managed',label:'Managed',disabled:true}]} value={value} />}</AppFormField></AppForm></DemoPreview></DemoSection></DemoPage>
}
