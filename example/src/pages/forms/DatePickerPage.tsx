import { useState } from 'react'
import {
  AppButton,
  AppDatePicker,
  AppDialog,
  AppForm,
  AppFormField,
  formatAppDateISO,
  useAppForm,
  type AppDateValue,
} from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'

const defaultDate = { year: 2026, month: 7, day: 16 }

function isWeekend(value: AppDateValue) {
  const day = new Date(value.year, value.month - 1, value.day).getDay()
  return day === 0 || day === 6
}

export function DatePickerPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  type DatePickerForm = {
    controlledDate: AppDateValue | null
    courseDate: AppDateValue | null
    dialogDate: AppDateValue | null
  }
  const form = useAppForm<DatePickerForm>({ defaultValues: { controlledDate: defaultDate, courseDate: null, dialogDate: null } })

  return (
    <DemoPage>
      <AppForm form={form}>
      <DemoSection title="Basic and default values">
        <DemoPreview className="demo-form-stack">
          <AppDatePicker />
          <AppDatePicker defaultValue={defaultDate} />
          <AppDatePicker allowClear defaultValue={defaultDate} />
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Controlled">
        <DemoPreview className="demo-form-stack">
          <AppFormField<DatePickerForm, AppDateValue | null> label="Selected date" name="controlledDate">{({ setValue, value }) => <><AppDatePicker allowClear onValueChange={setValue} value={value} /><span className="demo-note">Current value: {value ? formatAppDateISO(value) : 'none'}</span></>}</AppFormField>
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
          The first picker is limited to July 8–24, and month navigation
          cannot leave July. The second disables weekends.
        </p>
      </DemoSection>

      <DemoSection title="Disabled, read-only, and validation">
        <DemoPreview className="demo-form-stack">
          <AppDatePicker disabled value={defaultDate} />
          <AppDatePicker readOnly value={defaultDate} />
          <AppFormField<DatePickerForm, AppDateValue | null> label="Course date" name="courseDate" required requiredMessage="Choose a course date">{({ setValue, value }) => <AppDatePicker allowClear onValueChange={setValue} value={value} />}</AppFormField>
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
                onClick={() => void form.submit().then((success) => { if (success) setDialogOpen(false) })}
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
          <AppFormField<DatePickerForm, AppDateValue | null> label="Start date" name="dialogDate">{({ setValue, value }) => <AppDatePicker allowClear onValueChange={setValue} value={value} />}</AppFormField>
        </AppDialog>
      </DemoSection>
      </AppForm>
    </DemoPage>
  )
}
