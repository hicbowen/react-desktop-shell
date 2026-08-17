import { useState } from 'react'
import { AppCheckBox, AppComboBox, AppForm, AppFormField, useAppForm } from '../../../../src'
import { DemoControls, DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'
import { useDemoCopy } from '../../i18n/interactiveTranslations'

const courses = [
  { value: 'python', label: 'Python' },
  { value: 'visual', label: 'Visual coding' },
  { value: 'archived', label: 'Archived course', disabled: true },
]

type ComboDemoForm = {
  course: string
  validationCourse: string
}

export function AppComboBoxPage() {
  const t = useDemoCopy()
  const [compact, setCompact] = useState(false)
  const size = compact ? 'compact' : 'standard'
  const form = useAppForm<ComboDemoForm>({ defaultValues: { course: 'python', validationCourse: '' } })

  return (
    <DemoPage>
      <DemoControls>
        <AppCheckBox checked={compact} label={t('Compact controls')} onCheckedChange={setCompact} />
      </DemoControls>
      <DemoSection
        title="Filter and select"
        description="Type to filter the option list, then choose a matching option with the pointer or keyboard."
      >
        <DemoPreview className="demo-form-stack">
          <AppForm className="demo-form-stack" form={form}>
            <AppFormField<ComboDemoForm, string> label={t('Controlled course')} name="course">
              {({ value, setValue }) => <AppComboBox clearable onValueChange={setValue} options={courses} placeholder={t('Choose a course')} size={size} value={value} />}
            </AppFormField>
            <AppComboBox defaultValue="visual" options={courses} placeholder={t('Choose a course')} size={size} />
          </AppForm>
        </DemoPreview>
      </DemoSection>

      <DemoSection
        title="Strict option values"
        description="Typing only filters the list. Unsupported text is restored on blur, and only choosing an option commits its value."
      >
        <DemoPreview className="demo-form-stack">
          <AppComboBox
            clearable
            defaultValue="python"
            options={courses}
            placeholder={t('Choose a course')}
            size={size}
          />
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Disabled, read-only, and validation">
        <DemoPreview className="demo-form-stack">
          <AppForm form={form}>
            <AppFormField<ComboDemoForm, string> label={t('Course')} name="validationCourse" required>
              {({ value, setValue }) => <AppComboBox invalid={value === ''} options={courses} placeholder={t('Choose a course')} size={size} value={value} onValueChange={setValue} />}
            </AppFormField>
          </AppForm>
          <AppComboBox disabled options={courses} size={size} value="python" />
          <AppComboBox options={courses} readOnly size={size} value="visual" />
        </DemoPreview>
      </DemoSection>

      <DemoSection title="Choosing the right control">
        <DemoPreview className="demo-stack">
          <p className="demo-note">
            Use AppSelect when input must stay within a fixed native option list.
          </p>
          <p className="demo-note">
            Use AppComboBox when users must choose a labelled option but need text filtering.
          </p>
          <p className="demo-note">
            Use AppAutoComplete for free text with suggestions rather than a selected option value.
          </p>
        </DemoPreview>
      </DemoSection>
    </DemoPage>
  )
}
