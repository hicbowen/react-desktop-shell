import { useState } from 'react'
import { AppColorPicker, AppColorPickerPanel } from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'

export function AppColorPickerPage() {
  const [color, setColor] = useState<string | null>('#0078D4')
  return <DemoPage><DemoSection title="Color picker" description="Choose an opaque color from an HSV surface, hue slider, hex value, or preset palette."><DemoPreview><AppColorPicker allowClear onValueChange={setColor} value={color} /></DemoPreview></DemoSection><DemoSection title="Inline panel"><DemoPreview><AppColorPickerPanel onValueChange={setColor} value={color} /></DemoPreview></DemoSection></DemoPage>
}
