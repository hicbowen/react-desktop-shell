import { useState } from 'react'
import { AppCheckBox, AppComboBox, AppField } from '../../../../src'
import { DemoControls, DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'
import { useDemoCopy } from '../../i18n/interactiveTranslations'

const courses = [
  { value: 'python', label: 'Python' },
  { value: 'visual', label: 'Visual coding' },
  { value: 'archived', label: 'Archived course', disabled: true },
]

export function AppComboBoxPage() {
  const t = useDemoCopy()
  const [course, setCourse] = useState('python')
  const [compact, setCompact] = useState(false)
  const size = compact ? 'compact' : 'standard'

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
          <AppComboBox
            clearable
            onValueChange={setCourse}
            options={courses}
            placeholder={t('Choose a course')}
            size={size}
            value={course}
          />
          <AppComboBox
            defaultValue="visual"
            options={courses}
            placeholder={t('Choose a course')}
            size={size}
          />
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
          <AppField error={t('Choose a course')} label={t('Course')} required>
            <AppComboBox
              invalid
              options={courses}
              placeholder={t('Choose a course')}
              size={size}
            />
          </AppField>
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
