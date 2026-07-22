import { useState } from 'react'
import { AppCalendar, formatAppDateISO, type AppDateValue } from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'

export function AppCalendarPage() {
  const [value, setValue] = useState<AppDateValue | null>(null)
  return <DemoPage><DemoSection title="Embedded calendar" description="Use the same accessible calendar surface independently from date-picker inputs."><DemoPreview><div style={{ display: 'grid', gap: 12, justifyItems: 'start' }}><AppCalendar onValueChange={setValue} value={value} /><span>Selected: {value ? formatAppDateISO(value) : 'None'}</span></div></DemoPreview></DemoSection></DemoPage>
}
