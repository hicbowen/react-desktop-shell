import {
  AppCalendar,
  AppForm,
  AppFormField,
  formatAppDateISO,
  useAppForm,
  type AppDateValue,
} from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'

type CalendarForm = {
  value: AppDateValue | null
}

export function AppCalendarPage() {
  const form = useAppForm<CalendarForm>({ defaultValues: { value: null } })

  return <DemoPage><DemoSection title="Embedded calendar" description="Use the same accessible calendar surface independently from date-picker inputs."><DemoPreview><AppForm form={form}><AppFormField<CalendarForm, AppDateValue | null> label="Date" name="value">{({ setValue, value }) => <div style={{ display: 'grid', gap: 12, justifyItems: 'start' }}><AppCalendar onValueChange={(next) => setValue(next)} value={value} /><span>Selected: {value ? formatAppDateISO(value) : 'None'}</span></div>}</AppFormField></AppForm></DemoPreview></DemoSection></DemoPage>
}
