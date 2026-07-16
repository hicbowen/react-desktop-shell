import { useState } from 'react'
import {
  AppButton,
  AppDateRangePicker,
  AppDialog,
  AppField,
  formatAppDateISO,
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
  const [controlled, setControlled] =
    useState<AppDateRangeValue | null>(defaultRange)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogRange, setDialogRange] =
    useState<AppDateRangeValue | null>(null)

  return (
    <DemoPage>
      <DemoSection title="Basic range">
        <DemoPreview className="demo-form-stack">
          <AppDateRangePicker />
          <AppDateRangePicker allowClear defaultValue={defaultRange} />
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Controlled Apply">
        <DemoPreview className="demo-form-stack">
          <AppDateRangePicker
            allowClear
            onValueChange={setControlled}
            value={controlled}
          />
          <span className="demo-note">
            Applied range: {rangeLabel(controlled)}
          </span>
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
          <AppField error="Choose a reporting period" label="Report period" required>
            <AppDateRangePicker
              allowClear
              endName="reportEnd"
              startName="reportStart"
            />
          </AppField>
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
          <AppDateRangePicker
            onValueChange={setDialogRange}
            value={dialogRange}
            visibleMonths="responsive"
          />
          <p className="demo-note">Applied: {rangeLabel(dialogRange)}</p>
        </AppDialog>
      </DemoSection>
    </DemoPage>
  )
}
