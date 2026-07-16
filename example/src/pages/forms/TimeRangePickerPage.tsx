import { useState } from 'react'
import {
  AppButton,
  AppDialog,
  AppField,
  AppTimeRangePicker,
  formatAppTimeISO,
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
  const [controlled, setControlled] =
    useState<AppTimeRangeValue | null>(defaultRange)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogRange, setDialogRange] =
    useState<AppTimeRangeValue | null>(null)

  return (
    <DemoPage>
      <DemoSection title="Basic time range">
        <DemoPreview className="demo-form-stack">
          <AppTimeRangePicker />
          <AppTimeRangePicker allowClear defaultValue={defaultRange} />
          <span className="demo-note">
            Current range: {rangeText(controlled)} · Duration:{' '}
            {rangeDuration(controlled)} minutes
          </span>
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Controlled">
        <DemoPreview className="demo-form-stack">
          <AppTimeRangePicker
            allowClear
            minuteStep={5}
            onValueChange={setControlled}
            value={controlled}
          />
          <span className="demo-note">
            Applied range: {rangeText(controlled)}
          </span>
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
          <AppField error="Choose a valid meeting time" label="Meeting" required>
            <AppTimeRangePicker
              allowClear
              endName="meetingEnd"
              minuteStep={5}
              startName="meetingStart"
            />
          </AppField>
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
          <AppTimeRangePicker
            minuteStep={5}
            onValueChange={setDialogRange}
            value={dialogRange}
          />
          <p className="demo-note">Applied: {rangeText(dialogRange)}</p>
        </AppDialog>
      </DemoSection>
    </DemoPage>
  )
}
