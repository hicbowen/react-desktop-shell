import { useState } from 'react'
import { AppField, AppSelect, AppTextBox } from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'
import { getEmailValidationError } from '../forms/emailValidation'

export function AppFieldPage() {
  const [email, setEmail] = useState('')
  const emailError = getEmailValidationError(email)

  return (
    <DemoPage>
      <DemoSection title="Field structure">
        <DemoPreview className="demo-form-stack">
          <AppField
            description="Used in feedback and learning plans"
            id="student-name"
            label="Student name"
            required
          >
            <AppTextBox />
          </AppField>
          <AppField
            id="course"
            label="Course"
            labelWidth={140}
            orientation="horizontal"
          >
            <AppSelect
              defaultValue="python"
              options={[
                { value: 'python', label: 'Python' },
                { value: 'visual-coding', label: 'Visual coding' },
              ]}
            />
          </AppField>
          <AppField
            error={emailError ?? undefined}
            id="email"
            label="Email"
            required
          >
            <AppTextBox
              onChange={(event) => setEmail(event.currentTarget.value)}
              type="email"
              value={email}
            />
          </AppField>
          <AppField disabled id="locked" label="Managed value">
            <AppTextBox value="Administrator" readOnly />
          </AppField>
        </DemoPreview>
      </DemoSection>
    </DemoPage>
  )
}
