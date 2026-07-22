import { useState } from 'react'
import { AppRadioGroup } from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'

export function AppRadioGroupPage() {
  const [density, setDensity] = useState('comfortable')
  return <DemoPage><DemoSection title="Radio groups"><DemoPreview><AppRadioGroup description="Controls spacing throughout the workspace." label="Interface density" onValueChange={setDensity} options={[{value:'compact',label:'Compact',description:'Fit more content on screen.'},{value:'comfortable',label:'Comfortable',description:'Use balanced spacing.'},{value:'spacious',label:'Spacious',description:'Increase room between controls.'},{value:'managed',label:'Managed by organization',disabled:true}]} value={density}/></DemoPreview></DemoSection></DemoPage>
}
