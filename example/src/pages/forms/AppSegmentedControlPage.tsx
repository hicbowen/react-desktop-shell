import { AlignJustify, Columns3, Rows3 } from '../../components/fluentIcons'
import { AppForm, AppFormField, AppSegmentedControl, useAppForm } from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'

export function AppSegmentedControlPage() {
  type SegmentedForm = { layout: string }
  const form = useAppForm<SegmentedForm>({ defaultValues: { layout: 'list' } })
  return (
    <DemoPage>
      <DemoSection
        description="Compare the default and compact control sizes while keeping both examples interactive."
        title="Segmented controls"
      >
        <DemoPreview className="demo-form-stack">
          <AppForm className="demo-form-stack" form={form}>
            <div className="demo-stack">
              <span className="demo-note">Default (standard)</span>
              <AppFormField<SegmentedForm, string> label="Layout" name="layout">
                {({ value, setValue }) => (
                  <AppSegmentedControl
                    ariaLabel="Layout"
                    onValueChange={setValue}
                    options={[
                      { value: 'list', label: 'List', icon: <AlignJustify /> },
                      { value: 'grid', label: 'Grid', icon: <Columns3 /> },
                      { value: 'rows', label: 'Rows', icon: <Rows3 /> },
                    ]}
                    value={value}
                  />
                )}
              </AppFormField>
            </div>
            <div className="demo-stack">
              <span className="demo-note">Compact</span>
              <AppSegmentedControl
                ariaLabel="Time range"
                defaultValue="week"
                options={[
                  { value: 'day', label: 'Day' },
                  { value: 'week', label: 'Week' },
                  { value: 'month', label: 'Month' },
                ]}
                size="compact"
              />
            </div>
          </AppForm>
        </DemoPreview>
      </DemoSection>
    </DemoPage>
  )
}
