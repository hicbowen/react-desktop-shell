import { useState } from 'react'
import { AppCascader, AppField, type AppCascaderOption } from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'

const regions: AppCascaderOption[] = [
  {
    value: 'china', label: 'China', children: [
      { value: 'zhejiang', label: 'Zhejiang', children: [{ value: 'hangzhou', label: 'Hangzhou' }, { value: 'ningbo', label: 'Ningbo' }] },
      { value: 'jiangsu', label: 'Jiangsu', children: [{ value: 'nanjing', label: 'Nanjing' }, { value: 'suzhou', label: 'Suzhou' }] },
    ],
  },
  {
    value: 'usa', label: 'United States', children: [
      { value: 'california', label: 'California', children: [{ value: 'san-francisco', label: 'San Francisco' }, { value: 'los-angeles', label: 'Los Angeles' }] },
      { value: 'washington', label: 'Washington', children: [{ value: 'seattle', label: 'Seattle' }] },
    ],
  },
  { value: 'japan', label: 'Japan', children: [{ value: 'tokyo', label: 'Tokyo' }, { value: 'osaka', label: 'Osaka', disabled: true }] },
]

export function CascaderPage() {
  const [region, setRegion] = useState<string[]>(['china', 'zhejiang', 'hangzhou'])
  return <DemoPage>
    <DemoSection title="Region paths" description="Choose a leaf from successive columns. Use the arrow keys to move within and between levels.">
      <DemoPreview className="demo-form-stack">
        <AppCascader clearable onValueChange={setRegion} options={regions} value={region} />
        <AppCascader options={regions} placeholder="Choose a region" />
        <AppCascader defaultValue={['usa', 'california', 'san-francisco']} options={regions} separator=" → " />
        <AppCascader invalid options={regions} placeholder="Required" />
        <AppCascader disabled options={regions} value={['japan', 'tokyo']} />
        <AppField id="office-region" label="Office region" orientation="horizontal">
          <AppCascader name="region" options={regions} placeholder="Choose an office" />
        </AppField>
      </DemoPreview>
    </DemoSection>
  </DemoPage>
}
