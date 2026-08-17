import { useState } from 'react'
import {
  AppButton,
  AppDateRangePicker,
  AppDialog,
  AppForm,
  AppFormField,
  formatAppDateISO,
  useAppForm,
  type AppDateRangeValue,
} from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'

const defaultRange: AppDateRangeValue = {
  start: { year: 2026, month: 7, day: 1 },
  end: { year: 2026, month: 7, day: 16 },
}

function rangeLabel(value: AppDateRangeValue | null) {
  return value
    ? `${formatAppDateISO(value.start)} → ${formatAppDateISO(value.end)}`
    : 'none'
}

export function DateRangePickerPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  type DateRangeForm = {
    controlledRange: AppDateRangeValue | null
    automaticRange: AppDateRangeValue | null
    reportPeriod: AppDateRangeValue | null
    dialogRange: AppDateRangeValue | null
  }
  const form = useAppForm<DateRangeForm>({ defaultValues: { controlledRange: defaultRange, automaticRange: null, reportPeriod: null, dialogRange: null } })

  return (
    <DemoPage>
      <AppForm form={form}>
      <DemoSection title="Basic range">
        <DemoPreview className="demo-form-stack">
          <AppDateRangePicker />
          <AppDateRangePicker allowClear defaultValue={defaultRange} />
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Controlled Apply">
        <DemoPreview className="demo-form-stack">
          <AppFormField<DateRangeForm, AppDateRangeValue | null> label="Applied range" name="controlledRange">{({ setValue, value }) => <><AppDateRangePicker allowClear onValueChange={setValue} value={value} /><span className="demo-note">Applied range: {rangeLabel(value)}</span></>}</AppFormField>
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Automatic commit">
        <DemoPreview className="demo-form-stack">
          <AppFormField<DateRangeForm, AppDateRangeValue | null> label="Selected range" name="automaticRange">{({ setValue, value }) => <><AppDateRangePicker commitMode="auto" onValueChange={setValue} value={value} /><span className="demo-note">Selected range: {rangeLabel(value)}</span></>}</AppFormField>
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Two months and date limits">
        <DemoPreview className="demo-form-stack">
          <AppDateRangePicker
            defaultValue={defaultRange}
            visibleMonths={2}
          />
          <AppDateRangePicker
            maxValue={{ year: 2026, month: 8, day: 31 }}
            minValue={{ year: 2026, month: 7, day: 1 }}
            visibleMonths={1}
          />
        </DemoPreview>
        <p className="demo-note">
          The second picker is limited to July–August 2026, including
          month navigation.
        </p>
      </DemoSection>

      <DemoSection title="Duration limits">
        <DemoPreview className="demo-form-stack">
          <AppDateRangePicker minDuration={2} visibleMonths={1} />
          <AppDateRangePicker maxDuration={14} visibleMonths={1} />
        </DemoPreview>
        <p className="demo-note">
          Apply stays disabled until the inclusive range length is valid.
        </p>
      </DemoSection>

      <DemoSection title="Disabled, read-only, and validation">
        <DemoPreview className="demo-form-stack">
          <AppDateRangePicker disabled value={defaultRange} />
          <AppDateRangePicker readOnly value={defaultRange} />
          <AppFormField<DateRangeForm, AppDateRangeValue | null> label="Report period" name="reportPeriod" required requiredMessage="Choose a reporting period">{({ setValue, value }) => <AppDateRangePicker allowClear onValueChange={setValue} value={value} />}</AppFormField>
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Inside a dialog">
        <AppButton onClick={() => setDialogOpen(true)}>Choose range</AppButton>
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
          description="Pending dates commit only when the picker Apply button is used."
          onOpenChange={setDialogOpen}
          open={dialogOpen}
          title="Reporting period"
        >
          <AppFormField<DateRangeForm, AppDateRangeValue | null> label="Dialog range" name="dialogRange">{({ setValue, value }) => <><AppDateRangePicker onValueChange={setValue} value={value} visibleMonths="responsive" /><p className="demo-note">Applied: {rangeLabel(value)}</p></>}</AppFormField>
        </AppDialog>
      </DemoSection>
      </AppForm>
    </DemoPage>
  )
}
