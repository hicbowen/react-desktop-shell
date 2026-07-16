import { useState } from 'react'
import {
  AppButton,
  AppDatePicker,
  AppDialog,
  AppField,
  formatAppDateISO,
  type AppDateValue,
} from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'

const defaultDate = { year: 2026, month: 7, day: 16 }

function isWeekend(value: AppDateValue) {
  const day = new Date(value.year, value.month - 1, value.day).getDay()
  return day === 0 || day === 6
}

export function DatePickerPage() {
  const [controlled, setControlled] = useState<AppDateValue | null>(defaultDate)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogDate, setDialogDate] = useState<AppDateValue | null>(null)

  return (
    <DemoPage>
      <DemoSection title="Basic and default values">
        <DemoPreview className="demo-form-stack">
          <AppDatePicker />
          <AppDatePicker defaultValue={defaultDate} />
          <AppDatePicker allowClear defaultValue={defaultDate} />
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Controlled">
        <DemoPreview className="demo-form-stack">
          <AppDatePicker
            allowClear
            onValueChange={setControlled}
            value={controlled}
          />
          <span className="demo-note">
            Current value: {controlled ? formatAppDateISO(controlled) : 'none'}
          </span>
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Date constraints">
        <DemoPreview className="demo-form-stack">
          <AppDatePicker
            defaultValue={defaultDate}
            maxValue={{ year: 2026, month: 7, day: 24 }}
            minValue={{ year: 2026, month: 7, day: 8 }}
          />
          <AppDatePicker
            defaultValue={defaultDate}
            isDateUnavailable={isWeekend}
          />
        </DemoPreview>
        <p className="demo-note">
          The first picker is limited to July 8–24. The second disables weekends.
        </p>
      </DemoSection>

      <DemoSection title="Disabled, read-only, and validation">
        <DemoPreview className="demo-form-stack">
          <AppDatePicker disabled value={defaultDate} />
          <AppDatePicker readOnly value={defaultDate} />
          <AppField error="Choose a course date" label="Course date" required>
            <AppDatePicker allowClear name="courseDate" />
          </AppField>
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Inside a dialog">
        <AppButton onClick={() => setDialogOpen(true)}>Schedule course</AppButton>
        <AppDialog
          actions={
            <>
              <AppButton onClick={() => setDialogOpen(false)}>Cancel</AppButton>
              <AppButton
                appearance="primary"
                onClick={() => setDialogOpen(false)}
              >
                Save
              </AppButton>
            </>
          }
          description="The calendar portals into this dialog's local overlay host."
          onOpenChange={setDialogOpen}
          open={dialogOpen}
          title="Course schedule"
        >
          <AppField label="Start date">
            <AppDatePicker
              allowClear
              onValueChange={setDialogDate}
              value={dialogDate}
            />
          </AppField>
        </AppDialog>
      </DemoSection>
    </DemoPage>
  )
}
