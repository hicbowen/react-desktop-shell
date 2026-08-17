import { useState } from 'react'
import {
  AppButton,
  AppDialog,
  AppForm,
  AppFormField,
  AppTimeRangePicker,
  formatAppTimeISO,
  useAppForm,
  type AppTimeRangeValue,
} from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'

const defaultRange: AppTimeRangeValue = {
  start: { hour: 9, minute: 0 },
  end: { hour: 10, minute: 30 },
}

function rangeText(value: AppTimeRangeValue | null) {
  if (!value) return 'none'
  return `${formatAppTimeISO(value.start)}–${formatAppTimeISO(value.end)}`
}

function rangeDuration(value: AppTimeRangeValue | null) {
  if (!value) return 0
  return (
    value.end.hour * 60 +
    value.end.minute -
    (value.start.hour * 60 + value.start.minute)
  )
}

export function TimeRangePickerPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  type TimeRangeForm = {
    controlledRange: AppTimeRangeValue | null
    meetingRange: AppTimeRangeValue | null
    dialogRange: AppTimeRangeValue | null
  }
  const form = useAppForm<TimeRangeForm>({ defaultValues: { controlledRange: defaultRange, meetingRange: null, dialogRange: null } })

  return (
    <DemoPage>
      <AppForm form={form}>
      <DemoSection title="Basic time range">
        <DemoPreview className="demo-form-stack">
          <AppTimeRangePicker />
          <AppTimeRangePicker allowClear defaultValue={defaultRange} />
          <AppFormField<TimeRangeForm, AppTimeRangeValue | null> label="Current range" name="controlledRange">{({ value }) => <span className="demo-note">Current range: {rangeText(value)} · Duration: {rangeDuration(value)} minutes</span>}</AppFormField>
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Controlled">
        <DemoPreview className="demo-form-stack">
          <AppFormField<TimeRangeForm, AppTimeRangeValue | null> label="Applied range" name="controlledRange">{({ setValue, value }) => <><AppTimeRangePicker allowClear minuteStep={5} onValueChange={setValue} value={value} /><span className="demo-note">Applied range: {rangeText(value)}</span></>}</AppFormField>
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Steps, limits, and duration">
        <DemoPreview className="demo-form-stack">
          <AppTimeRangePicker minuteStep={15} />
          <AppTimeRangePicker
            maxValue={{ hour: 18, minute: 0 }}
            minValue={{ hour: 8, minute: 0 }}
            minuteStep={5}
          />
          <AppTimeRangePicker
            maxDuration={180}
            minDuration={30}
            minuteStep={5}
          />
          <AppTimeRangePicker
            defaultValue={defaultRange}
            minuteStep={5}
          />
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Disabled, read-only, and validation">
        <DemoPreview className="demo-form-stack">
          <AppTimeRangePicker disabled value={defaultRange} />
          <AppTimeRangePicker readOnly value={defaultRange} />
          <AppFormField<TimeRangeForm, AppTimeRangeValue | null> label="Meeting" name="meetingRange" required requiredMessage="Choose a valid meeting time">{({ setValue, value }) => <AppTimeRangePicker allowClear minuteStep={5} onValueChange={setValue} value={value} />}</AppFormField>
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Inside a dialog">
        <AppButton onClick={() => setDialogOpen(true)}>Schedule meeting</AppButton>
        <AppDialog
          actions={
            <>
              <AppButton onClick={() => setDialogOpen(false)}>Cancel</AppButton>
              <AppButton
                appearance="primary"
                onClick={() => setDialogOpen(false)}
              >
                Done
              </AppButton>
            </>
          }
          description="The range is committed only by the picker Apply button."
          onOpenChange={setDialogOpen}
          open={dialogOpen}
          title="Meeting time"
        >
          <AppFormField<TimeRangeForm, AppTimeRangeValue | null> label="Meeting range" name="dialogRange">{({ setValue, value }) => <><AppTimeRangePicker minuteStep={5} onValueChange={setValue} value={value} /><p className="demo-note">Applied: {rangeText(value)}</p></>}</AppFormField>
        </AppDialog>
      </DemoSection>
      </AppForm>
    </DemoPage>
  )
}
