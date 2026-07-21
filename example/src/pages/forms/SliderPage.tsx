import { useState } from 'react'
import { AppField, AppSlider } from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'

export function SliderPage() {
  const [volume, setVolume] = useState(45)
  return <DemoPage>
    <DemoSection title="Slider values" description="Use sliders for relative adjustments; use a number box when exact entry is the primary task.">
      <DemoPreview className="demo-form-stack">
        <AppSlider aria-label="Volume" onValueChange={setVolume} showValue value={volume} />
        <AppSlider aria-label="Zoom" defaultValue={125} formatValue={(value) => `${value}%`} max={200} min={50} showValue step={25} />
        <AppSlider aria-label="Compact slider" defaultValue={30} size="compact" />
        <AppSlider aria-label="Disabled slider" disabled value={65} />
        <AppSlider aria-label="Invalid slider" invalid value={20} />
        <AppField id="brush-size" label="Brush size" orientation="horizontal">
          <AppSlider formatValue={(value) => `${value}px`} max={48} min={1} name="brush-size" showValue value={12} />
        </AppField>
      </DemoPreview>
    </DemoSection>
    <DemoSection title="Marks and orientation">
      <DemoPreview className="demo-component-row">
        <AppSlider aria-label="Quality" defaultValue={50} marks={[{ value: 0, label: 'Low' }, { value: 50, label: 'Medium' }, { value: 100, label: 'High' }]} step={10} />
        <AppSlider aria-label="Vertical level" defaultValue={60} marks={[{ value: 0, label: '0' }, { value: 50, label: '50' }, { value: 100, label: '100' }]} orientation="vertical" showValue />
      </DemoPreview>
    </DemoSection>
  </DemoPage>
}
