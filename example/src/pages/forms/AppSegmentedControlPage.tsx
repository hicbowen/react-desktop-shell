import { useState } from 'react'
import { AlignJustify, Columns3, Rows3 } from 'lucide-react'
import { AppSegmentedControl } from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'

export function AppSegmentedControlPage() {
  const [layout, setLayout] = useState('list')
  return <DemoPage><DemoSection title="Segmented controls"><DemoPreview className="demo-form-stack"><AppSegmentedControl ariaLabel="Layout" onValueChange={setLayout} options={[{value:'list',label:'List',icon:<AlignJustify/>},{value:'grid',label:'Grid',icon:<Columns3/>},{value:'rows',label:'Rows',icon:<Rows3/>}]} value={layout}/><AppSegmentedControl ariaLabel="Time range" defaultValue="week" options={[{value:'day',label:'Day'},{value:'week',label:'Week'},{value:'month',label:'Month'}]} size="compact"/></DemoPreview></DemoSection></DemoPage>
}
