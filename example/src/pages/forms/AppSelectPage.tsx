import { useState } from 'react'
import { AppCheckBox, AppField, AppSelect } from '../../../../src'
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

export function AppSelectPage() {
  const t = useDemoCopy()
  const [course, setCourse] = useState('python')
  const [compact, setCompact] = useState(false)
  const size = compact ? 'compact' : 'standard'

  return <DemoPage>
    <DemoControls>
      <AppCheckBox checked={compact} label={t('Compact controls')} onCheckedChange={setCompact} />
    </DemoControls>
    <DemoSection title="Select controls">
      <DemoPreview className="demo-form-stack">
        <AppSelect onValueChange={(value) => value && setCourse(value)} options={courses} size={size} value={course} />
        <AppSelect clearable defaultValue="python" options={courses} placeholder="Choose a course" size={size} />
        <AppSelect options={courses} placeholder="Choose a course" size={size} />
        <AppField error="Required" id="required-course-select" label="Course" required>
          <AppSelect options={courses} placeholder="Choose a course" size={size} />
        </AppField>
        <AppSelect disabled options={courses} size={size} value="python" />
        <AppField id="course-select" label="Course" orientation="horizontal">
          <AppSelect defaultValue="python" name="course" options={courses} size={size} />
        </AppField>
      </DemoPreview>
    </DemoSection>
    <DemoSection title="Long option list" description="120 options for checking picker positioning, scrolling, and viewport boundaries.">
      <DemoPreview className="demo-form-stack">
        <AppSelect defaultValue="option-60" options={manyOptions} size={size} />
      </DemoPreview>
    </DemoSection>
  </DemoPage>
}
