import { useState } from 'react'
import {
  AppButton,
  AppDialog,
  AppForm,
  AppFormField,
  AppTimePicker,
  formatAppTimeISO,
  useAppForm,
  type AppTimeValue,
} from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'

const defaultTime = { hour: 18, minute: 30 }

export function TimePickerPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  type TimePickerForm = {
    controlledTime: AppTimeValue | null
    reminderTime: AppTimeValue | null
    dialogTime: AppTimeValue | null
  }
  const form = useAppForm<TimePickerForm>({ defaultValues: { controlledTime: defaultTime, reminderTime: null, dialogTime: null } })

  return (
    <DemoPage>
      <AppForm form={form}>
      <DemoSection title="Basic and default values">
        <DemoPreview className="demo-form-stack">
          <AppTimePicker />
          <AppTimePicker defaultValue={defaultTime} />
          <AppTimePicker allowClear defaultValue={defaultTime} />
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Controlled Apply and Cancel">
        <DemoPreview className="demo-form-stack">
          <AppFormField<TimePickerForm, AppTimeValue | null> label="Applied time" name="controlledTime">{({ setValue, value }) => <><AppTimePicker allowClear minuteStep={5} onValueChange={setValue} value={value} /><span className="demo-note">Applied time: {value ? formatAppTimeISO(value) : 'none'}</span></>}</AppFormField>
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
            minuteStep={5}
          />
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Disabled, read-only, and validation">
        <DemoPreview className="demo-form-stack">
          <AppTimePicker disabled value={defaultTime} />
          <AppTimePicker readOnly value={defaultTime} />
          <AppFormField<TimePickerForm, AppTimeValue | null> label="Reminder" name="reminderTime" required requiredMessage="Choose a reminder time">{({ setValue, value }) => <AppTimePicker allowClear minuteStep={5} onValueChange={setValue} value={value} />}</AppFormField>
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
          <AppFormField<TimePickerForm, AppTimeValue | null> label="Time" name="dialogTime">{({ setValue, value }) => <AppTimePicker allowClear minuteStep={5} onValueChange={setValue} value={value} />}</AppFormField>
        </AppDialog>
      </DemoSection>
      </AppForm>
    </DemoPage>
  )
}
