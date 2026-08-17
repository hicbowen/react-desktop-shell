import { useState } from 'react'
import { AppCheckBox, AppForm, AppFormField, AppSelect, useAppForm } from '../../../../src'
import { DemoControls, DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'
import { useDemoCopy } from '../../i18n/interactiveTranslations'

const courses = [{ value: 'python', label: 'Python' }, { value: 'visual', label: 'Visual coding' }, { value: 'archived', label: 'Archived course', disabled: true }]
const manyOptions = Array.from({ length: 120 }, (_, index) => {
  const number = index + 1
  return {
    value: `option-${number}`,
    label: `Option ${number.toString().padStart(3, '0')}`,
  }
})

type SelectDemoForm = {
  course: string
  requiredCourse: string | null
  horizontalCourse: string
}

export function AppSelectPage() {
  const t = useDemoCopy()
  const [compact, setCompact] = useState(false)
  const size = compact ? 'compact' : 'standard'
  const form = useAppForm<SelectDemoForm>({ defaultValues: { course: 'python', requiredCourse: null, horizontalCourse: 'python' } })

  return <DemoPage>
    <DemoControls>
      <AppCheckBox checked={compact} label={t('Compact controls')} onCheckedChange={setCompact} />
    </DemoControls>
    <DemoSection title="Select controls">
      <DemoPreview className="demo-form-stack">
        <AppForm className="demo-form-stack" form={form}>
          <AppFormField<SelectDemoForm, string> label="Controlled course" name="course">
            {({ value, setValue }) => <AppSelect onValueChange={(next) => next != null && setValue(next)} options={courses} size={size} value={value} />}
          </AppFormField>
          <AppSelect clearable defaultValue="python" options={courses} placeholder="Choose a course" size={size} />
          <AppSelect options={courses} placeholder="Choose a course" size={size} />
          <AppFormField<SelectDemoForm, string | null> label="Course" name="requiredCourse" required>
            {({ value, setValue }) => <AppSelect options={courses} placeholder="Choose a course" size={size} value={value} onValueChange={setValue} />}
          </AppFormField>
          <AppSelect disabled options={courses} size={size} value="python" />
          <AppFormField<SelectDemoForm, string> label="Course" name="horizontalCourse">
            {({ value, setValue }) => <AppSelect options={courses} size={size} value={value} onValueChange={(next) => next != null && setValue(next)} />}
          </AppFormField>
        </AppForm>
      </DemoPreview>
    </DemoSection>
    <DemoSection title="Long option list" description="120 options for checking picker positioning, scrolling, and viewport boundaries.">
      <DemoPreview className="demo-form-stack">
        <AppSelect defaultValue="option-60" options={manyOptions} size={size} />
      </DemoPreview>
    </DemoSection>
  </DemoPage>
}
