import { AppForm, AppFormField, AppRadioGroup, useAppForm } from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'

export function AppRadioGroupPage() {
  type RadioForm = { density: string }
  const form = useAppForm<RadioForm>({ defaultValues: { density: 'comfortable' } })
  return <DemoPage><DemoSection title="Radio groups"><DemoPreview><AppForm form={form}><AppFormField<RadioForm, string> label="Interface density" name="density">{({ value, setValue }) => <AppRadioGroup description="Controls spacing throughout the workspace." onValueChange={setValue} options={[{value:'compact',label:'Compact',description:'Fit more content on screen.'},{value:'comfortable',label:'Comfortable',description:'Use balanced spacing.'},{value:'spacious',label:'Spacious',description:'Increase room between controls.'},{value:'managed',label:'Managed by organization',disabled:true}]} value={value} />}</AppFormField></AppForm></DemoPreview></DemoSection></DemoPage>
}
