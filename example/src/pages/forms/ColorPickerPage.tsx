import {
  AppColorPicker,
  AppColorPickerPanel,
  AppForm,
  AppFormField,
  useAppForm,
} from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'

type ColorPickerForm = {
  color: string | null
}

export function AppColorPickerPage() {
  const form = useAppForm<ColorPickerForm>({ defaultValues: { color: '#0078D4' } })
  return <DemoPage><AppForm form={form}><DemoSection title="Color picker" description="Choose an opaque color from an HSV surface, hue slider, hex value, or preset palette."><DemoPreview><AppFormField<ColorPickerForm, string | null> label="Color" name="color">{({ setValue, value }) => <AppColorPicker allowClear onValueChange={setValue} value={value} />}</AppFormField></DemoPreview></DemoSection><DemoSection title="Inline panel"><DemoPreview><AppFormField<ColorPickerForm, string | null> label="Color" name="color">{({ setValue, value }) => <AppColorPickerPanel onValueChange={setValue} value={value} />}</AppFormField></DemoPreview></DemoSection></AppForm></DemoPage>
}
