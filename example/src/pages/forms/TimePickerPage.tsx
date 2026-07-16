import { useState } from 'react'
import {
  AppButton,
  AppDialog,
  AppField,
  AppTimePicker,
  formatAppTimeISO,
  type AppTimeValue,
} from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'

const defaultTime = { hour: 18, minute: 30 }

export function TimePickerPage() {
  const [controlled, setControlled] =
    useState<AppTimeValue | null>(defaultTime)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogTime, setDialogTime] = useState<AppTimeValue | null>(null)

  return (
    <DemoPage>
      <DemoSection title="Basic and default values">
        <DemoPreview className="demo-form-stack">
          <AppTimePicker />
          <AppTimePicker defaultValue={defaultTime} />
          <AppTimePicker allowClear defaultValue={defaultTime} />
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Controlled Apply and Cancel">
        <DemoPreview className="demo-form-stack">
          <AppTimePicker
            allowClear
            minuteStep={5}
            onValueChange={setControlled}
            value={controlled}
          />
          <span className="demo-note">
            Applied time: {controlled ? formatAppTimeISO(controlled) : 'none'}
          </span>
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Steps, limits, and 12-hour display">
        <DemoPreview className="demo-form-stack">
          <AppTimePicker defaultValue={defaultTime} minuteStep={15} />
          <AppTimePicker
            defaultValue={{ hour: 9, minute: 30 }}
            maxValue={{ hour: 18, minute: 0 }}
            minValue={{ hour: 9, minute: 30 }}
            minuteStep={5}
          />
          <AppTimePicker
            defaultValue={defaultTime}
            hourCycle={12}
            minuteStep={5}
          />
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Disabled, read-only, and validation">
        <DemoPreview className="demo-form-stack">
          <AppTimePicker disabled value={defaultTime} />
          <AppTimePicker readOnly value={defaultTime} />
          <AppField error="Choose a reminder time" label="Reminder" required>
            <AppTimePicker allowClear minuteStep={5} name="reminderTime" />
          </AppField>
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Inside a dialog">
        <AppButton onClick={() => setDialogOpen(true)}>Set reminder</AppButton>
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
          description="The time panel uses this dialog's local overlay host."
          onOpenChange={setDialogOpen}
          open={dialogOpen}
          title="Reminder time"
        >
          <AppField label="Time">
            <AppTimePicker
              allowClear
              minuteStep={5}
              onValueChange={setDialogTime}
              value={dialogTime}
            />
          </AppField>
        </AppDialog>
      </DemoSection>
    </DemoPage>
  )
}
